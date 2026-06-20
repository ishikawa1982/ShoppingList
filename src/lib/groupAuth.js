import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getDb } from './firebase.js'
import { seedLists } from './boardApi.js'

// グループ名を Firestore のドキュメントID（boards/{groupId}）として使える形に正規化する。
// 例: "  田中 家  " → "田中-家"。空白は詰めて連結し、前後の空白を除去、小文字化する。
export function normalizeGroupId(name) {
  const id = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
  if (!id) throw new Error('グループ名を入力してください')
  if (id.includes('/')) throw new Error('グループ名に「/」は使えません')
  return id
}

// 合言葉をハッシュ化（平文保存を避ける）。Web Crypto を使うのでサーバー不要。
// グループ名を salt に混ぜて、別グループで同じ合言葉でもハッシュが変わるようにする。
export async function hashPassword(groupId, password) {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) throw new Error('この環境では合言葉を暗号化できません（HTTPSが必要です）')
  const data = new TextEncoder().encode(`${groupId}:${password}`)
  const digest = await subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * グループ名＋合言葉でログインする（サーバーなしの簡易認証）。
 * - 未使用のグループ名 → 新規作成し、入力者をオーナーに、手元の lists を引き継ぐ。
 * - 既存のグループ名 → 合言葉のハッシュが一致すれば参加、違えばエラー。
 * @returns {Promise<{ boardId: string, created: boolean }>}
 */
export async function loginGroup({ groupId: rawId, password, lists = [], ownerId }) {
  if (!password) throw new Error('合言葉を入力してください')
  const db = getDb()
  if (!db) throw new Error('Firebase が未設定です')

  const groupId = normalizeGroupId(rawId)
  const groupName = String(rawId).trim()
  const authHash = await hashPassword(groupId, password)
  const ref = doc(db, 'boards', groupId)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    await setDoc(ref, {
      createdAt: Date.now(),
      ownerId: ownerId || null,
      authHash,
      groupName,
    })
    await seedLists(db, groupId, lists)
    return { boardId: groupId, created: true }
  }

  const data = snap.data()
  if (!data.authHash) {
    throw new Error('このグループ名は使えません（別の共有と重複しています）')
  }
  if (data.authHash !== authHash) {
    throw new Error('合言葉が違います')
  }
  // 旧グループ（groupName 未保存）に合言葉ログインしたら、表示名を補完しておく
  if (!data.groupName) {
    await setDoc(ref, { groupName }, { merge: true })
  }
  return { boardId: groupId, created: false }
}
