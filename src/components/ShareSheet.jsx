import { useState } from 'react'
import Sheet from './Sheet.jsx'

export default function ShareSheet({
  configured,
  isShared,
  url,
  onStart,
  onStop,
  onClose,
}) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

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

  const [startError, setStartError] = useState(null)

  async function start() {
    setBusy(true)
    setStartError(null)
    try {
      await onStart()
    } catch (err) {
      console.error('共有開始エラー', err)
      setStartError(err?.message || '共有の開始に失敗しました')
    } finally {
      setBusy(false)
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
        <p className="hint">
          共有を始めると、今のリストをクラウドに保存して招待リンクを発行します。
          リンクを知っている人とリアルタイムで同じリストを使えます。
        </p>
        {startError && (
          <p className="hint" style={{ color: 'var(--color-danger, #e53935)' }}>
            ⚠️ {startError}
          </p>
        )}
        <button className="btn btn--primary" onClick={start} disabled={busy}>
          {busy ? '準備中…' : '🔗 共有を始める'}
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
