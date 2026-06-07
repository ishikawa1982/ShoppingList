import { useState } from 'react'
import Sheet from './Sheet.jsx'

/**
 * リストの追加 / 編集シート。
 * mode = 'add' は名前入力のみ、'edit' は名前変更 + 削除。
 */
export default function ListSheet({ mode, initialName = '', canDelete, onSubmit, onDelete, onClose }) {
  const [name, setName] = useState(initialName)

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name)
  }

  return (
    <Sheet title={mode === 'add' ? 'リストを追加' : 'リストを編集'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="sheet__row">
          <input
            className="sheet__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="リスト名（例: 週末の買い物）"
            aria-label="リスト名"
            autoFocus
          />
        </div>
        <div className="sheet__actions">
          {mode === 'edit' && (
            <button
              type="button"
              className="btn btn--danger"
              disabled={!canDelete}
              title={canDelete ? '' : '最後の1つは削除できません'}
              onClick={onDelete}
            >
              削除
            </button>
          )}
          <button type="submit" className="btn btn--primary">
            {mode === 'add' ? '追加' : '保存'}
          </button>
        </div>
      </form>
    </Sheet>
  )
}
