import { useState } from 'react'
import Sheet from './Sheet.jsx'

const isStandalone =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(display-mode: standalone)').matches === true

function parseBoardId(input) {
  if (!input) return null
  const m = input.trim().match(/[?&]board=([a-z0-9]+)/)
  if (m) return m[1]
  if (/^[a-z0-9]{10,}$/.test(input.trim())) return input.trim()
  return null
}

export default function ShareSheet({
  configured,
  isShared,
  url,
  onStart,
  onStop,
  onJoin,
  onClose,
}) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [joinUrl, setJoinUrl] = useState('')
  const [joinError, setJoinError] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'かいものリスト', url })
      } catch {
        /* キャンセル時は何もしない */
      }
    } else {
      copy()
    }
  }

  async function start() {
    setBusy(true)
    try {
      await onStart()
    } finally {
      setBusy(false)
    }
  }

  function handleJoin() {
    const boardId = parseBoardId(joinUrl)
    if (boardId) {
      setJoinError(false)
      onJoin(boardId)
    } else {
      setJoinError(true)
    }
  }

  if (!configured) {
    return (
      <Sheet title="リストを共有" onClose={onClose}>
        <p className="hint">
          共有機能を使うには Firebase の設定が必要です。README の手順に沿って
          設定値を登録すると、家族とリアルタイムで共有できるようになります。
        </p>
        <button className="btn btn--ghost" onClick={onClose}>
          閉じる
        </button>
      </Sheet>
    )
  }

  if (!isShared) {
    return (
      <Sheet title="リストを共有" onClose={onClose}>
        {isStandalone && (
          <p className="hint" style={{ background: 'var(--accent-soft)', borderRadius: 8, padding: '8px 12px' }}>
            💡 ブラウザで共有中のリストがあれば、下の入力欄に招待リンクを貼り付けて参加できます。
          </p>
        )}
        <p className="hint">
          共有を始めると、今のリストをクラウドに保存して招待リンクを発行します。
          リンクを知っている人とリアルタイムで同じリストを使えます。
        </p>
        <button className="btn btn--primary" onClick={start} disabled={busy}>
          {busy ? '準備中…' : '🔗 共有を始める'}
        </button>
        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
        <p className="hint">すでに招待リンクをお持ちですか？</p>
        <div className="sheet__row">
          <input
            className="sheet__input"
            value={joinUrl}
            onChange={(e) => { setJoinUrl(e.target.value); setJoinError(false) }}
            placeholder="招待リンクを貼り付け"
          />
        </div>
        {joinError && (
          <p className="hint" style={{ color: 'var(--danger)', marginTop: 4 }}>
            リンクが正しくありません。招待リンクをそのまま貼り付けてください。
          </p>
        )}
        <button
          className="btn btn--ghost"
          onClick={handleJoin}
          disabled={!joinUrl.trim()}
        >
          参加する
        </button>
      </Sheet>
    )
  }

  return (
    <Sheet title="このリストを共有中" onClose={onClose}>
      <div className="sheet__row">
        <span className="sheet__label">招待リンク</span>
        <input className="sheet__input" value={url} readOnly onFocus={(e) => e.target.select()} />
      </div>
      <div className="sheet__actions">
        <button className="btn btn--ghost" onClick={copy}>
          {copied ? '✓ コピーしました' : 'リンクをコピー'}
        </button>
        <button className="btn btn--primary" onClick={nativeShare}>
          共有する
        </button>
      </div>
      <p className="hint" style={{ marginTop: 16 }}>
        このリンクを家族に送ると、同じリストをみんなで編集できます。
      </p>
      <button className="link-btn" style={{ marginTop: 8 }} onClick={onStop}>
        共有をやめてこの端末だけに戻す
      </button>
    </Sheet>
  )
}
