import { initializeApp, getApps } from 'firebase/app'
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore'
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig.js'

let db = null

// Firestore を遅延初期化して返す。未設定なら null。
// オフラインでも使えるよう IndexedDB の永続キャッシュを有効化する（PWA 向け）。
export function getDb() {
  if (!isFirebaseConfigured()) return null
  if (!db) {
    const app = getApps()[0] || initializeApp(firebaseConfig)
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentSingleTabManager(),
        }),
      })
    } catch (err) {
      // 既に初期化済みなどのケースはキャッシュ無しで取得
      console.warn('Firestore 永続キャッシュを有効化できませんでした', err)
      db = getFirestore(app)
    }
  }
  return db
}

export { isFirebaseConfigured }
