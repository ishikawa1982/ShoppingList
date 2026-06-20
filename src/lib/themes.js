// 選べるテーマカラー（minto を参考にした淡色系）
export const THEMES = [
  { id: 'mint', label: 'ミント', accent: '#2ec4a6' },
  { id: 'blue', label: 'ブルー', accent: '#3b9bf0' },
  { id: 'pink', label: 'ピンク', accent: '#f06292' },
  { id: 'purple', label: 'パープル', accent: '#9575e0' },
  { id: 'orange', label: 'オレンジ', accent: '#f0993b' },
  { id: 'red', label: 'レッド', accent: '#ef5350' },
  { id: 'cyan', label: 'シアン', accent: '#00bcd4' },
  { id: 'green', label: 'グリーン', accent: '#43a047' },
  { id: 'indigo', label: 'インディゴ', accent: '#5c6bc0' },
  { id: 'brown', label: 'ブラウン', accent: '#8d6e63' },
]

export function themeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0]
}

// アクセント色 + ダークモードを :root に反映する
export function applyAppearance({ themeId, dark }) {
  const root = document.documentElement
  const accent = themeById(themeId).accent
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-soft', accent + '1a')
  root.setAttribute('data-theme', dark ? 'dark' : 'light')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', accent)
}
