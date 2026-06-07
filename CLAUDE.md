# 開発メモ（Claude 向け）

## バージョン運用（重要）
- **修正を加えるたびに `package.json` の `version` を上げる**（バグ修正=パッチ, 機能追加=マイナー）。
- バージョンは画面下部に小さく表示される（`src/App.jsx` の `__APP_VERSION__`、`vite.config.js` の `define` で `package.json` から注入）。
- **コミット時、ユーザーに「今回のバージョン番号」を必ず伝える**。

## プロジェクト概要
- React 18 + Vite 5 の買い物リスト（minto 参考）。GitHub Pages（サブパス `/ShoppingList/`）に GitHub Actions で自動デプロイ。
- ローカル保存（localStorage）＋ Firebase Firestore による招待リンク共有（ログイン不要）。
- データ層は `useLocalBoard` / `useCloudBoard` で同じインターフェイス。
- 共有の管理は作成者（`ownerId` 一致）のみ。通知は起動中のみ（閉じた配信は未実装＝無料リレー予定）。

## お作法
- 変更後は `npm test`（vitest）と `npm run build` を通す。
- Firestore のルール変更時はユーザーに再公開を依頼（`firestore.rules`）。
- コミットは feature ブランチ。PR #1 に反映される。
