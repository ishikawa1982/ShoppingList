import { useEffect, useRef, useState } from 'react'

export default function Item({ item, onToggle, onEdit, onRemove, showWho, dragHandlers }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.name)
  const [imgOpen, setImgOpen] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function commit() {
    const name = draft.trim()
    if (name && name !== item.name) onEdit({ name })
    setEditing(false)
  }

  const { onPointerDown, style, className: dragClass = '' } = dragHandlers || {}

  return (
    <li
      className={'item' + (item.checked ? ' item--checked' : '') + dragClass}
      style={style}
      onPointerDown={onPointerDown}
      data-draggable={dragHandlers ? 'true' : undefined}
    >
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
          onClick={() => {
            setDraft(item.name)
            setEditing(true)
          }}
          title="タップで編集"
        >
          <span className="item__name">{item.name}</span>
          {showWho && item.by && (
            <span className="item__who">{item.by}</span>
          )}
        </button>
      )}

      {item.imageDataUrl && (
        <button
          type="button"
          className="item__thumb-btn"
          onClick={() => setImgOpen(true)}
          aria-label="画像を表示"
        >
          <img src={item.imageDataUrl} className="item__thumb" alt={item.name} />
        </button>
      )}

      <button className="item__del" onClick={onRemove} aria-label="削除">
        ✕
      </button>

      {imgOpen && (
        <div className="img-overlay" onClick={() => setImgOpen(false)} role="dialog" aria-modal="true">
          <img src={item.imageDataUrl} className="img-overlay__img" alt={item.name} />
        </div>
      )}
    </li>
  )
}
