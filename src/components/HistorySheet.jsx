import { useEffect, useState } from 'react'
import Sheet from './Sheet.jsx'
import { fetchActivity } from '../lib/activityApi.js'

// 行為タイプ → 表示文（{item} / {list} を埋める）
const VERB = {
  add: '「{item}」を追加',
  delete: '「{item}」を削除',
  check: '「{item}」を購入済みに',
  uncheck: '「{item}」を未購入に戻す',
  edit: '「{item}」を編集',
  clear: '購入済みをまとめて削除',
  addList: 'リスト「{list}」を追加',
  renameList: 'リスト名を「{list}」に変更',
  removeList: 'リスト「{list}」を削除',
}

function describe(e) {
  const tmpl = VERB[e.type] || e.type
  return tmpl.replace('{item}', e.itemName || '').replace('{list}', e.listName || '')
}

function timeLabel(ts) {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const hm = d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return hm
  const md = d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
  return `${md} ${hm}`
}

export default function HistorySheet({ boardId, onClose }) {
  const [entries, setEntries] = useState(null) // null = 読み込み中

  useEffect(() => {
    let alive = true
    fetchActivity(boardId)
      .then((list) => alive && setEntries(list))
      .catch(() => alive && setEntries([]))
    return () => {
      alive = false
    }
  }, [boardId])

  return (
    <Sheet title="履歴" onClose={onClose}>
      {entries === null ? (
        <p className="hint">読み込み中…</p>
      ) : entries.length === 0 ? (
        <p className="hint">まだ記録がありません。共有後の操作がここに表示されます。</p>
      ) : (
        <ul className="activity">
          {entries.map((e) => (
            <li key={e.id} className="activity__item">
              <span className="activity__who">{e.by || '名無し'}</span>
              <span className="activity__what">さんが {describe(e)}</span>
              <span className="activity__time">{timeLabel(e.at)}</span>
            </li>
          ))}
        </ul>
      )}
      <button className="btn btn--ghost" style={{ marginTop: 12 }} onClick={onClose}>
        閉じる
      </button>
    </Sheet>
  )
}
