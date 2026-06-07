// ブラウザ通知のユーティリティ（追加費用・サーバー不要の範囲）。
// アプリが起動中（フォアグラウンド/バックグラウンドのタブ）に通知を出す。

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission() {
  return notificationsSupported() ? Notification.permission : 'denied'
}

// 通知の許可を求める。許可されたら true。
export async function requestPermission() {
  if (!notificationsSupported()) return false
  if (Notification.permission === 'granted') return true
  try {
    const res = await Notification.requestPermission()
    return res === 'granted'
  } catch {
    return false
  }
}

// 通知を表示する。Service Worker があればそちら経由（PWA で確実）。
export function showNotification(title, body, url) {
  if (notificationPermission() !== 'granted') return
  const options = {
    body,
    icon: './pwa-192x192.png',
    badge: './pwa-192x192.png',
    data: url || (import.meta.env.BASE_URL || '/'),
    tag: 'shopping-update',
    renotify: true,
  }
  if (navigator.serviceWorker?.ready) {
    navigator.serviceWorker.ready
      .then((reg) => reg.showNotification(title, options))
      .catch(() => fallback(title, options))
  } else {
    fallback(title, options)
  }
}

function fallback(title, options) {
  try {
    // eslint-disable-next-line no-new
    new Notification(title, options)
  } catch {
    /* 表示できない環境では何もしない */
  }
}
