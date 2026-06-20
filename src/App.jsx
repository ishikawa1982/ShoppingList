import { useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { useInstallPrompt } from './hooks/useInstallPrompt.js'
import { useLocalBoard } from './hooks/useLocalBoard.js'
import { useCloudBoard } from './hooks/useCloudBoard.js'
import { useChangeNotifications } from './hooks/useChangeNotifications.js'
import { useAnonymousAuth } from './hooks/useAnonymousAuth.js'
import { requestPermission } from './lib/notify.js'
import { sortedItems } from './lib/store.js'
import { applyAppearance } from './lib/themes.js'
import { isFirebaseConfigured } from './lib/firebase.js'
import { createBoard, genBoardId, inviteUrl } from './lib/boardApi.js'
import { loginGroup } from './lib/groupAuth.js'
import AddBar from './components/AddBar.jsx'
import Tabs from './components/Tabs.jsx'
import Item from './components/Item.jsx'
import SettingsSheet from './components/SettingsSheet.jsx'
import ListSheet from './components/ListSheet.jsx'
import ShareSheet from './components/ShareSheet.jsx'
import LoginSheet from './components/LoginSheet.jsx'
import HistorySheet from './components/HistorySheet.jsx'

// URL の ?board= を書き換える（リロードなし）。
// 招待リンクを開いた後もパラメータを残すことで、「ホーム画面に追加」した
// アイコン（特に iOS は現在URLを取り込む）から起動しても共有ボードに参加できる。
function syncBoardParam(boardId) {
  const base = import.meta.env.BASE_URL || '/'
  const params = new URLSearchParams(window.location.search)
  if (boardId) params.set('board', boardId)
  else params.delete('board')
  const qs = params.toString()
  window.history.replaceState({}, '', base + (qs ? '?' + qs : ''))
}

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

export default function App() {
  const [settings, setSettings] = useLocalStorage('shopping.settings.v1', {
    themeId: 'blue',
    dark: false,
  })
  const [profile, setProfile] = useLocalStorage('shopping.profile', { name: '' })
  const [localClientId] = useLocalStorage('shopping.clientId', () => genBoardId())
  const { uid: firebaseUid, loading: authLoading } = useAnonymousAuth()
  const [boardId, setBoardId] = useLocalStorage('shopping.boardId', null)
  const [group, setGroup] = useLocalStorage('shopping.group', '') // 合言葉ログイン中のグループ名（表示用）
  const [activeId, setActiveId] = useState(null)
  const [sheet, setSheet] = useState(null) // 'settings' | 'addList' | 'editList' | 'share' | 'login' | 'history' | null
  const install = useInstallPrompt()

  const configured = isFirebaseConfigured()
  const clientId = configured ? (firebaseUid ?? localClientId) : localClientId
  const effectiveBoardId = configured ? boardId : null
  const actor = profile.name.trim() || '名無し'

  // データ層: 共有中はクラウド、そうでなければローカル（フックは常に両方呼ぶ）
  const local = useLocalBoard()
  const cloud = useCloudBoard(effectiveBoardId, actor, clientId)
  const board = effectiveBoardId ? cloud : local
  const lists = board.lists

  // 共有中、他の人の追加/購入済みをブラウザ通知（アプリ起動中のみ）
  useChangeNotifications(lists, {
    enabled: !!effectiveBoardId && !!settings.notify,
    clientId,
    boardId: effectiveBoardId,
  })

  // 外観をDOMに反映
  useEffect(() => {
    applyAppearance(settings)
  }, [settings])

  // 招待リンク (?board=...) で開かれたら、そのボードに参加する。
  // パラメータはあえて残す（ホーム画面に追加したアイコンからの起動でも参加できるように）。
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const b = params.get('board')
    if (b && isFirebaseConfigured()) {
      setBoardId(b)
      // 名前未設定で参加した場合は、まず名前を決めてもらう
      if (!profile.name.trim()) setSheet('settings')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // アクティブなリストが消えた / 未設定なら先頭に寄せる
  useEffect(() => {
    if (lists.length && !lists.some((l) => l.id === activeId)) {
      setActiveId(lists[0].id)
    }
  }, [lists, activeId])

  const activeList = useMemo(
    () => lists.find((l) => l.id === activeId) || lists[0],
    [lists, activeId],
  )

  const items = activeList ? sortedItems(activeList.items) : []
  const remaining = items.filter((it) => !it.checked).length
  const hasChecked = items.some((it) => it.checked)
  const loading = !!effectiveBoardId && !cloud.ready

  // 共有の管理者かどうか（最初に共有した人 = ownerId が自分の端末ID）。
  // ownerId が無い旧ボードは誰でも操作可とする（ロックアウト防止）。
  const isOwner = !cloud.ownerId || cloud.ownerId === clientId || cloud.ownerId === localClientId
  // 未共有なら自分が共有を始められる。共有中は管理者のみ操作可。
  const canManageShare = !effectiveBoardId || isOwner

  // --- item handlers ---
  const handleAddItem = (name, imageDataUrl) => board.addItem(activeList.id, name, imageDataUrl)
  const handleToggle = (id) => board.toggleItem(activeList.id, id)
  const handleEdit = (id, patch) => board.editItem(activeList.id, id, patch)
  const handleRemove = (id) => board.removeItem(activeList.id, id)
  const handleClearChecked = () => {
    const count = items.filter((it) => it.checked).length
    if (count === 0) return
    if (window.confirm(`購入済みの ${count} 件を消します。よろしいですか？`)) {
      board.clearChecked(activeList.id)
    }
  }

  // --- list handlers ---
  const handleAddList = (name) => {
    const id = board.addList(name)
    setSheet(null)
    if (id) setActiveId(id)
  }
  const handleRenameList = (name) => {
    board.renameList(activeList.id, name)
    setSheet(null)
  }
  const handleDeleteList = () => {
    board.removeList(activeList.id)
    setSheet(null)
  }

  // --- share handlers ---
  const handleStartShare = async () => {
    const id = await createBoard(local.lists, clientId)
    setBoardId(id)
    setActiveId(null)
    // 自分のホーム画面アイコンからの起動でも共有を維持できるようURLに残す
    syncBoardParam(id)
  }

  // 合言葉ログイン: グループ名＋合言葉で共有リストに入る（新規ならローカルのリストを引き継ぐ）。
  // 失敗時は例外を投げ、LoginSheet 側でエラー表示する。
  const handleGroupLogin = async ({ group: groupName, password, name }) => {
    if (name) setProfile({ ...profile, name })
    const { boardId: id } = await loginGroup({
      groupId: groupName,
      password,
      lists: local.lists,
      ownerId: clientId,
    })
    setBoardId(id)
    setGroup(groupName.trim())
    setActiveId(null)
    syncBoardParam(id)
    setSheet(null)
  }
  const handleToggleNotify = async () => {
    if (settings.notify) {
      setSettings({ ...settings, notify: false })
      return
    }
    const ok = await requestPermission()
    setSettings({ ...settings, notify: ok })
    if (!ok) {
      alert('通知が許可されませんでした。ブラウザ／OSの設定で通知を許可してください。')
    }
  }

  const handleStopShare = () => {
    local.replaceAll(cloud.lists.map(({ order, ...l }) => l))
    setBoardId(null)
    setGroup('')
    setActiveId(null)
    setSheet(null)
    // URLからもboardを除去（次回起動で再参加しないように）
    syncBoardParam(null)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header__top">
          <h1 className="header__title">
            <CartIcon />
            {group || '買物リスト'}
            {effectiveBoardId && <span className="badge">共有中</span>}
          </h1>
          <div className="header__actions">
            {effectiveBoardId && (
              <button className="icon-btn" onClick={() => setSheet('history')} aria-label="履歴">
                🕒
              </button>
            )}
            <button
              className="icon-btn"
              onClick={() => setSheet('share')}
              disabled={!canManageShare}
              title={canManageShare ? '共有' : '共有の管理は作成者のみ可能です'}
              aria-label="共有"
            >
              {effectiveBoardId ? '👨‍👩‍👧' : '🔗'}
            </button>
            <button className="icon-btn" onClick={() => setSheet('settings')} aria-label="設定">
              ⚙
            </button>
          </div>
        </div>
        <Tabs
          lists={lists}
          activeId={activeList?.id}
          onSelect={setActiveId}
          onAdd={() => setSheet('addList')}
        />
      </header>

      <main className="main">
        <AddBar onAdd={handleAddItem} />

        {loading ? (
          <div className="empty">
            <span className="empty__emoji">☁️</span>
            共有リストを読み込み中…
          </div>
        ) : items.length === 0 ? (
          <div className="empty">
            <span className="empty__emoji">🛒</span>
            まだ何もありません。
            <br />
            上の入力欄から追加しましょう。
          </div>
        ) : (
          <>
            <ul className="items">
              {items.map((it) => (
                <Item
                  key={it.id}
                  item={it}
                  showWho={!!effectiveBoardId}
                  onToggle={() => handleToggle(it.id)}
                  onEdit={(patch) => handleEdit(it.id, patch)}
                  onRemove={() => handleRemove(it.id)}
                />
              ))}
            </ul>
            <div className="list-footer">
              <span>残り {remaining} 件</span>
              <div>
                <button className="link-btn" onClick={() => setSheet('editList')}>
                  リスト編集
                </button>
                {hasChecked && (
                  <button className="link-btn" onClick={handleClearChecked}>
                    購入済みを消す
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="app__version">
        v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}
      </footer>

      {sheet === 'settings' && (
        <SettingsSheet
          settings={settings}
          onChange={setSettings}
          install={install}
          profile={profile}
          onProfileChange={setProfile}
          onToggleNotify={handleToggleNotify}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'history' && effectiveBoardId && (
        <HistorySheet boardId={effectiveBoardId} onClose={() => setSheet(null)} />
      )}

      {sheet === 'share' && (
        <ShareSheet
          configured={configured}
          isShared={!!effectiveBoardId}
          group={group}
          url={effectiveBoardId ? inviteUrl(effectiveBoardId) : ''}
          onStart={handleStartShare}
          onStop={handleStopShare}
          onOpenLogin={() => setSheet('login')}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'login' && (
        <LoginSheet
          initialName={profile.name}
          onLogin={handleGroupLogin}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'addList' && (
        <ListSheet
          mode="add"
          onSubmit={handleAddList}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === 'editList' && activeList && (
        <ListSheet
          mode="edit"
          initialName={activeList.name}
          canDelete={lists.length > 1}
          onSubmit={handleRenameList}
          onDelete={handleDeleteList}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  )
}
