// Firebase の設定値。
//
// Firebase コンソール（https://console.firebase.google.com/）→ プロジェクト設定
// → 「マイアプリ」の Web アプリ で表示される firebaseConfig をここに貼り付けます。
// これらの値は公開されても問題ありません（セキュリティは Firestore のルールで担保します）。
//
// 方法A（簡単）: 下の inline に直接貼り付けてコミットする
// 方法B（上級）: 環境変数 VITE_FIREBASE_* を設定する（こちらが優先されます）
const inline = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
}

const env = import.meta.env

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || inline.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || inline.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || inline.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || inline.storageBucket,
  messagingSenderId:
    env.VITE_FIREBASE_MESSAGING_SENDER_ID || inline.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || inline.appId,
}

// 共有機能を使える状態か（最低限 apiKey と projectId があれば OK）
export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
}
