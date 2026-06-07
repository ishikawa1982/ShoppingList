import { useEffect, useRef, useState } from 'react'

export default function Item({ item, onToggle, onEdit, onRemove, showWho }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.name)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function commit() {
    const name = draft.trim()
    if (name && name !== item.name) onEdit({ name })
    setEditing(false)
  }

  return (
    <li className={'item' + (item.checked ? ' item--checked' : '')}>
      <button
        className={'item__check' + (item.checked ? ' item__check--on' : '')}
        onClick={onToggle}
        aria-label={item.checked ? '未購入にする' : '購入済みにする'}
      >
        ✓
      </button>

      {editing ? (
        <input
          ref={inputRef}
          className="item__edit"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(item.name)
              setEditing(false)
            }
          }}
        />
      ) : (
        <button
          className="item__body"
          onDoubleClick={() => {
            setDraft(item.name)
            setEditing(true)
          }}
          onClick={onToggle}
          title="クリックでチェック / ダブルクリックで編集"
        >
          <span className="item__main">
            <span className="item__name">{item.name}</span>
            {item.qty && <span className="item__qty">{item.qty}</span>}
          </span>
          {showWho && (item.by || item.checkedBy) && (
            <span className="item__who">
              {item.checked && item.checkedBy
                ? `✓ ${item.checkedBy}`
                : item.by
                  ? `${item.by}`
                  : ''}
            </span>
          )}
        </button>
      )}

      <button className="item__del" onClick={onRemove} aria-label="削除">
        ✕
      </button>
    </li>
  )
}
