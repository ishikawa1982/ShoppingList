import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// GitHub Pages はサブパス(/ShoppingList/)で配信されるため、
// ビルド時のみ base をリポジトリ名に合わせる。dev はルート(/)のまま。
const base = process.env.NODE_ENV === 'production' ? '/ShoppingList/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['cart.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '買物リスト',
        short_name: '買物リスト',
        description: '家族で共有できる買物リスト',
        lang: 'ja',
        theme_color: '#3b9bf0',
        background_color: '#c9e0fd',
        display: 'standalone',
        orientation: 'portrait',
        // start_url / scope は base から自動設定される
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // SPA なので未キャッシュ要求は index.html へフォールバック（オフライン起動用）
        navigateFallback: base + 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      devOptions: {
        // 開発中(npm start)でも Service Worker を有効化して動作確認できる
        enabled: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
