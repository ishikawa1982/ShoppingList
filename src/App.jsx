import { useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { useInstallPrompt } from './hooks/useInstallPrompt.js'
import {
  addItem,
  addList,
  clearChecked,
  defaultState,
  editItem,
  removeItem,
  removeList,
  renameList,
  sortedItems,
  toggleItem,
} from './lib/store.js'
import { applyAppearance } from './lib/themes.js'
import AddBar from './components/AddBar.jsx'
import Tabs from './components/Tabs.jsx'
import Item from './components/Item.jsx'
import SettingsSheet from './components/SettingsSheet.jsx'
import ListSheet from './components/ListSheet.jsx'

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

export default function App() {
  const [state, setState] = useLocalStorage('shopping.state.v1', defaultState)
  const [settings, setSettings] = useLocalStorage('shopping.settings.v1', {
    themeId: 'mint',
    dark: false,
  })
  const [activeId, setActiveId] = useState(() => state.lists[0]?.id)
  const [sheet, setSheet] = useState(null) // 'settings' | 'addList' | 'editList' | null
  const install = useInstallPrompt()

  // 外観をDOMに反映
  useEffect(() => {
    applyAppearance(settings)
  }, [settings])

  // アクティブなリストが消えた / 未設定なら先頭に寄せる
  useEffect(() => {
    if (!state.lists.some((l) => l.id === activeId)) {
      setActiveId(state.lists[0]?.id)
    }
  }, [state.lists, activeId])

  const activeList = useMemo(
    () => state.lists.find((l) => l.id === activeId) || state.lists[0],
    [state.lists, activeId],
  )

  const items = activeList ? sortedItems(activeList.items) : []
  const remaining = items.filter((it) => !it.checked).length
  const hasChecked = items.some((it) => it.checked)

  // --- handlers ---
  const handleAddItem = (name, qty) =>
    setState((s) => addItem(s, activeList.id, name, qty))
  const handleToggle = (id) => setState((s) => toggleItem(s, activeList.id, id))
  const handleEdit = (id, patch) =>
    setState((s) => editItem(s, activeList.id, id, patch))
  const handleRemove = (id) => setState((s) => removeItem(s, activeList.id, id))
  const handleClearChecked = () =>
    setState((s) => clearChecked(s, activeList.id))

  const handleAddList = (name) => {
    let newId
    setState((s) => {
      const { state: next, list } = addList(s, name)
      newId = list.id
      return next
    })
    setSheet(null)
    if (newId) setActiveId(newId)
  }

  const handleRenameList = (name) => {
    setState((s) => renameList(s, activeList.id, name))
    setSheet(null)
  }

  const handleDeleteList = () => {
    setState((s) => removeList(s, activeList.id))
    setSheet(null)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header__top">
          <h1 className="header__title">
            <CartIcon />
            かいものリスト
          </h1>
          <button className="icon-btn" onClick={() => setSheet('settings')} aria-label="設定">
            ⚙
          </button>
        </div>
        <Tabs
          lists={state.lists}
          activeId={activeList?.id}
          onSelect={setActiveId}
          onAdd={() => setSheet('addList')}
        />
      </header>

      <main className="main">
        <AddBar onAdd={handleAddItem} />

        {items.length === 0 ? (
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

      {sheet === 'settings' && (
        <SettingsSheet
          settings={settings}
          onChange={setSettings}
          install={install}
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
          canDelete={state.lists.length > 1}
          onSubmit={handleRenameList}
          onDelete={handleDeleteList}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  )
}
