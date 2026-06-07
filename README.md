# ShoppingList（かいものリスト）

家族で共有できる買物リスト。[minto](https://mintotodo.app) を参考にした買い物リスト Web アプリです。

ローカル保存で動き、Firebase を設定すると **招待リンクでリアルタイム共有**できます。

## 機能（現在）

- 🛒 複数リストをタブで切り替え（追加 / 名前変更 / 削除）
- ➕ 品名 + 数量で買うものを追加
- ✓ タップでチェック（購入済みは下へ自動で並び替え）
- ✏️ ダブルクリックで品名を編集
- 🗑️ 個別削除 / 購入済みを一括クリア
- 🎨 テーマカラー 5 色 + ダークモード
- 💾 ブラウザ（localStorage）に自動保存・別タブにも反映
- 📲 PWA 対応（ホーム画面に追加・オフライン起動）
- 👨‍👩‍👧 招待リンクでリアルタイム共有（Firebase 設定時。ログイン不要）
- 🕒 共有時は「誰が追加・チェックしたか」を表示＋操作履歴（追加/削除など）を確認
- 👑 共有の管理は作成者（管理者）のみ。招待リンクで参加した人は共有操作を不可（アイコン非活性）

## 技術スタック

- React 18 + Vite 5
- 状態は localStorage に永続化（`src/hooks/useLocalStorage.js`）
- 状態操作は純粋関数に分離（`src/lib/store.js`）してテスト可能に
- Vitest + Testing Library

## 開発

```bash
npm install      # 依存関係のインストール
npm start        # 開発サーバー（http://localhost:5173）
npm run dev      # npm start と同じ（Vite）
npm run build    # 本番ビルド（dist/）
npm run preview  # ビルド結果のプレビュー
npm test         # テスト実行
```

## 構成

```
src/
  App.jsx                  アプリ全体の状態と画面構成
  hooks/
    useLocalStorage.js     localStorage 同期フック
    useLocalBoard.js       ローカル保存のデータ層
    useCloudBoard.js       Firestore リアルタイム同期のデータ層
    useInstallPrompt.js    PWA インストール導線
  lib/
    store.js               リスト/アイテム操作の純粋関数
    themes.js              テーマカラー定義と外観適用
    firebase.js            Firestore の遅延初期化
    firebaseConfig.js      Firebase 設定値（ここに貼り付け）
    boardApi.js            共有ボード作成 / 招待リンク
  components/              Tabs / AddBar / Item / Sheet / 各シート
firestore.rules            Firestore セキュリティルール
```

ローカルとクラウドのデータ層は同じインターフェイス（`useLocalBoard` / `useCloudBoard`）に
そろえてあり、共有の有無で App から差し替えています。

## PWA について

`vite-plugin-pwa` でホーム画面追加・オフライン起動に対応しています。

- アイコンは `public/pwa-*.png`（`scripts/make_icons.py` で生成。再生成には Python + Pillow が必要ですが、生成済み PNG はコミット済みなので通常は不要）
- インストール導線は設定シート内の「アプリ」セクション（Android / デスクトップはワンタップ、iOS は手動追加の案内）
- 動作確認はビルド版で：`npm run build && npm run preview`
- スマホで実機確認するには HTTPS での公開（デプロイ）が必要です

## リアルタイム共有（Firebase）のセットアップ

共有機能は **Firebase Firestore** を使います。未設定でもローカルリストとして普通に動きます。
設定すると、ヘッダーの 🔗 から「共有を始める」→ 招待リンクを家族に送るだけで、同じリストを
リアルタイムで編集できます（ログイン不要・招待リンクを知っている人だけがアクセス）。

### 手順

1. [Firebase コンソール](https://console.firebase.google.com/) で**プロジェクトを作成**（無料）
2. 左メニュー **構築 → Firestore Database → データベースを作成**（本番モードでOK / リージョンは asia-northeast1 など）
3. **ルール**タブに `firestore.rules` の内容を貼り付けて「公開」
4. プロジェクトのトップで **ウェブアプリ（</>）を追加** → 表示される `firebaseConfig` をコピー
5. その値を **`src/lib/firebaseConfig.js` の `inline` に貼り付けて**コミット
   （これらの値は公開して問題ありません。安全性は Firestore ルールで担保します）
   - ※ 代わりに環境変数 `VITE_FIREBASE_*`（`.env.local` や GitHub の Variables）でも可
6. `npm run build` → デプロイ。これで 🔗 から共有できるようになります

> ⚠️ この共有モデルは「リンクを知る人だけがアクセス」という前提のシンプルな方式です。
> より厳密にするには Firebase Authentication（ログイン）を追加してメンバー判定に切り替えます。

## 今後の予定（段階的）

- ログイン（Google など）でのメンバー管理・本人確認
- 招待 QR コード、リスト単位の共有
- リマインダー通知
