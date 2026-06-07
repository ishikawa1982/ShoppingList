import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore'
import { getDb } from './firebase.js'

// 共有ボードのアクティビティ（誰が何をしたか）を記録する。
// 失敗してもアプリ操作は止めない（ログは付随的なものなので握りつぶす）。
export function logActivity(boardId, entry) {
  const db = getDb()
  if (!db || !boardId) return
  addDoc(collection(db, 'boards', boardId, 'activity'), {
    at: Date.now(),
    ...entry,
  }).catch((err) => console.warn('アクティビティ記録に失敗', err))
}

// 直近のアクティビティを新しい順に取得する。
export async function fetchActivity(boardId, max = 50) {
  const db = getDb()
  if (!db || !boardId) return []
  const q = query(
    collection(db, 'boards', boardId, 'activity'),
    orderBy('at', 'desc'),
    limit(max),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
