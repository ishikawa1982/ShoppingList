import { collection, doc, setDoc } from 'firebase/firestore'
import { getDb } from './firebase.js'

// 推測されにくい共有ボードID（24文字）。URL を知っている人だけがアクセスできる方式。
export function genBoardId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  const buf = new Uint8Array(24)
  ;(globalThis.crypto || window.crypto).getRandomValues(buf)
  for (const b of buf) id += chars[b % chars.length]
  return id
}

// アイテム配列を Firestore 保存用のマップ（id をキー）に変換する
function itemsToMap(items = []) {
  const map = {}
  for (const it of items) {
    const { id, ...rest } = it
    map[id] = rest
  }
  return map
}

// 現在のリスト群からクラウドにボードを新規作成し、boardId を返す。
// ownerId（作成者の端末ID）を記録し、共有の管理権限の判定に使う。
export async function createBoard(lists, ownerId) {
  const db = getDb()
  if (!db) throw new Error('Firebase が未設定です')
  const boardId = genBoardId()
  await setDoc(doc(db, 'boards', boardId), {
    createdAt: Date.now(),
    ownerId: ownerId || null,
  })
  const listsCol = collection(db, 'boards', boardId, 'lists')
  let order = Date.now()
  for (const l of lists) {
    await setDoc(doc(listsCol, l.id), {
      name: l.name,
      order: order++,
      items: itemsToMap(l.items),
    })
  }
  return boardId
}

// 招待リンク（GitHub Pages のサブパスにも対応）
export function inviteUrl(boardId) {
  const base = import.meta.env.BASE_URL || '/'
  return `${window.location.origin}${base}?board=${boardId}`
}
