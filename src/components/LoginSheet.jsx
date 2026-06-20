import { useState } from 'react'
import Sheet from './Sheet.jsx'

/**
 * グループ名＋合言葉でログインして共有するシート（簡易認証）。
 * 同じグループ名・合言葉を家族に伝えれば、全員が同じリストに入れる。
 * 新しいグループ名なら新規作成、既存なら合言葉が一致すれば参加する。
 */
export default function LoginSheet({ initialName = '', onLogin, onClose }) {
  const [group, setGroup] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState(initialName)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!group.trim() || !password.trim()) return
    setBusy(true)
    setError('')
    try {
      await onLogin({ group, password, name: name.trim() })
      // 成功時は親がシートを閉じる
    } catch (err) {
      setError(err?.message || 'ログインに失敗しました')
      setBusy(false)
    }
  }

  return (
    <Sheet title="合言葉でログイン" onClose={onClose}>
      <p className="hint">
        同じ<strong>グループ名</strong>と<strong>合言葉</strong>を家族に伝えると、
        みんなで同じリストを使えます。新しいグループ名を入れると新規作成されます。
      </p>
      <form onSubmit={submit}>
        <div className="sheet__row">
          <span className="sheet__label">グループ名</span>
          <input
            className="sheet__input"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="例: 田中家の買い物"
            aria-label="グループ名"
            autoFocus
          />
        </div>
        <div className="sheet__row">
          <span className="sheet__label">合言葉（パスワード）</span>
          <input
            className="sheet__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="家族だけが知っている合言葉"
            aria-label="合言葉"
            autoComplete="current-password"
          />
        </div>
        <div className="sheet__row">
          <span className="sheet__label">あなたの名前（共有時に表示されます）</span>
          <input
            className="sheet__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: パパ / ママ"
            maxLength={20}
            aria-label="あなたの名前"
          />
        </div>

        {error && (
          <p className="hint" role="alert" style={{ color: 'var(--danger, #e0524d)' }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? '確認中…' : '🔑 ログインして共有'}
        </button>
      </form>

      <p className="hint" style={{ marginTop: 12 }}>
        ※ 簡易的な合言葉方式です。推測されにくいグループ名としっかりした合言葉にしてください。
      </p>
    </Sheet>
  )
}
