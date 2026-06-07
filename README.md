# ShoppingList（かいものリスト）

家族で共有できる買物リスト。[minto](https://mintotodo.app) を参考にした買い物リスト Web アプリです。

これは **ローカル MVP**（単一ユーザー / ブラウザ保存）の段階です。リアルタイム共有・ログイン・招待リンクは今後段階的に追加していきます。

## 機能（現在）

- 🛒 複数リストをタブで切り替え（追加 / 名前変更 / 削除）
- ➕ 品名 + 数量で買うものを追加
- ✓ タップでチェック（購入済みは下へ自動で並び替え）
- ✏️ ダブルクリックで品名を編集
- 🗑️ 個別削除 / 購入済みを一括クリア
- 🎨 テーマカラー 5 色 + ダークモード
- 💾 ブラウザ（localStorage）に自動保存・別タブにも反映
- 📲 PWA 対応（ホーム画面に追加・オフライン起動）

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
  App.jsx                 アプリ全体の状態と画面構成
  hooks/useLocalStorage.js  localStorage 同期フック
  lib/store.js            リスト/アイテム操作の純粋関数
  lib/store.test.js       store のユニットテスト
  lib/themes.js           テーマカラー定義と外観適用
  components/             Tabs / AddBar / Item / Sheet / 各シート
```

## PWA について

`vite-plugin-pwa` でホーム画面追加・オフライン起動に対応しています。

- アイコンは `public/pwa-*.png`（`scripts/make_icons.py` で生成。再生成には Python + Pillow が必要ですが、生成済み PNG はコミット済みなので通常は不要）
- インストール導線は設定シート内の「アプリ」セクション（Android / デスクトップはワンタップ、iOS は手動追加の案内）
- 動作確認はビルド版で：`npm run build && npm run preview`
- スマホで実機確認するには HTTPS での公開（デプロイ）が必要です

## 今後の予定（段階的）

- リアルタイム共有・クラウド同期（Firebase など）
- SNS ログインと招待リンク / QR
- リマインダー通知・PWA 化
