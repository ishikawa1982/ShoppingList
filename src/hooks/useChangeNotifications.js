import { useEffect, useRef } from 'react'
import { showNotification } from '../lib/notify.js'

/**
 * 共有リストの変化を監視して、他の人の操作をブラウザ通知する。
 * - 追加された品物（byId が自分以外）
 * - 購入済みになった品物（checkedById が自分以外）
 *
 * アプリが起動している間のみ動作する（onSnapshot が生きている前提）。
 * 完全に閉じている間の配信には別途プッシュ送信サーバーが必要。
 */
export function useChangeNotifications(lists, { enabled, clientId, boardId }) {
  const prev = useRef(null)

  // ボード切替や無効化のたびにベースラインをリセット
  useEffect(() => {
    prev.current = null
  }, [boardId, enabled])

  useEffect(() => {
    if (!enabled) return

    const cur = new Map()
    for (const l of lists) {
      for (const it of l.items) {
        cur.set(it.id, {
          name: it.name,
          checked: !!it.checked,
          by: it.by,
          byId: it.byId,
          checkedBy: it.checkedBy,
          checkedById: it.checkedById,
        })
      }
    }

    // 最初のスナップショットは基準にするだけ（過去分は通知しない）
    if (prev.current === null) {
      prev.current = cur
      return
    }

    const before = prev.current
    for (const [id, it] of cur) {
      const was = before.get(id)
      if (!was) {
        if (it.byId && it.byId !== clientId) {
          const who = it.by ? `${it.by}さんが` : ''
          showNotification('買物リスト', `${who}「${it.name}」を追加しました`)
        }
      } else if (it.checked && !was.checked) {
        if (it.checkedById && it.checkedById !== clientId) {
          const who = it.checkedBy ? `${it.checkedBy}さんが` : ''
          showNotification('買物リスト', `${who}「${it.name}」を購入済みにしました`)
        }
      }
    }
    prev.current = cur
  }, [lists, enabled, clientId])
}
