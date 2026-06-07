// 選べるテーマカラー（minto を参考にした淡色系）
export const THEMES = [
  { id: 'mint', label: 'ミント', accent: '#2ec4a6' },
  { id: 'blue', label: 'ブルー', accent: '#3b9bf0' },
  { id: 'pink', label: 'ピンク', accent: '#f06292' },
  { id: 'purple', label: 'パープル', accent: '#9575e0' },
  { id: 'orange', label: 'オレンジ', accent: '#f0993b' },
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
