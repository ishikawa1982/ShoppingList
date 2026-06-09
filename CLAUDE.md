# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

```bash
npm start          # 開発サーバー起動（Vite）
npm test           # vitest run（一回実行）
npm run build      # 本番ビルド（dist/）
npm run test:watch # ウォッチモード

# 単一テストファイルだけ実行
npx vitest run src/lib/store.test.js
```

変更後は必ず `npm test` と `npm run build` を通す。

## バージョン運用（重要）

**修正を加えるたびに `package.json` の `version` を上げる**（バグ修正=パッチ, 機能追加=マイナー）。  
`__APP_VERSION__` は `vite.config.js` の `define` で `package.json` から注入され、画面下部に表示される。  
**コミット時、ユーザーに「今回のバージョン番号」を必ず伝える**。

## アーキテクチャ

### データ層の切り替え

`App.jsx` は `useLocalBoard` と `useCloudBoard` の 2 つのフックを**常に両方呼び出し**、`effectiveBoardId` があるときだけクラウド側を使う：

```js
const board = effectiveBoardId ? cloud : local
```

両フックは同一インターフェイス（`items`, `lists`, `addItem`, `toggleItem`, `editItem`, `removeItem`, `clearChecked`, `addList`, `renameList`, `deleteList`, `startShare`, `stopShare`）を実装する。

### 状態ミューテーション

`src/lib/store.js` にすべての状態変換を純粋関数として集約。フックはこれを呼び出してから `useState` / Firestore に反映する。テストの主な対象はここ。

### Firebase（遅延初期化）

`src/lib/firebase.js` の `getDb()` は初回呼び出し時だけ Firestore を初期化し、IndexedDB キャッシュでオフライン対応する。`src/lib/firebaseConfig.js` に設定を直書きするか、`VITE_FIREBASE_*` 環境変数で渡す（CI は GitHub Variables）。

### PWA・デプロイ

- `vite-plugin-pwa`（`vite.config.js`）が Service Worker と `manifest.webmanifest` を生成する。
- GitHub Pages のサブパス `/ShoppingList/` は `vite.config.js` の `base` で制御（`NODE_ENV=production` 時のみ）。
- デプロイは GitHub Actions（`.github/workflows/deploy.yml`）。`npm test` → `npm run build` → `upload-pages-artifact` → `deploy-pages` の順。**デプロイを走らせたいブランチは `deploy.yml` の `branches:` に追加が必要**。

### 共有・オーナーシップ

ボードを作成すると `ownerId`（＝ `clientId`）が Firestore に保存される。`isOwner = ownerId === clientId` が `true` のときだけ共有の開始・停止が可能。空の `ownerId` は旧データとの後方互換のため誰でも管理可能として扱う。

### 通知

`useChangeNotifications.js` は Firestore のリアルタイム更新を監視し、自分以外の操作を検知したらブラウザ通知を出す。アプリが閉じているときは届かない（プッシュ通知サーバーは未実装）。

## Firestore ルール変更時

`firestore.rules` を変更したらユーザーに再公開を依頼する（`firebase deploy --only firestore:rules`）。

## コミット

コミットは feature ブランチ。PR #1 に反映される。
