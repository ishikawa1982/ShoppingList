import { useEffect, useState } from 'react'

/**
 * PWA の「ホーム画面に追加」を扱うフック。
 * Android / デスクトップ Chrome では beforeinstallprompt を捕まえて
 * 任意のタイミングでインストールダイアログを出せる。
 * iOS Safari はこのイベントを発火しないため、手動追加を案内する。
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(display-mode: standalone)').matches,
  )

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const isIos =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent)

  const promptInstall = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return {
    canInstall: !!deferred, // ネイティブのインストールダイアログが使えるか
    installed, // すでにインストール済み（standalone 起動）か
    isIos, // iOS は手動追加の案内が必要
    promptInstall,
  }
}
