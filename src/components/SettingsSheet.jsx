import Sheet from './Sheet.jsx'
import { THEMES } from '../lib/themes.js'

export default function SettingsSheet({ settings, onChange, onClose }) {
  return (
    <Sheet title="設定" onClose={onClose}>
      <div className="sheet__row">
        <span className="sheet__label">テーマカラー</span>
        <div className="swatches">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={'swatch' + (settings.themeId === t.id ? ' swatch--active' : '')}
              style={{ background: t.accent }}
              onClick={() => onChange({ ...settings, themeId: t.id })}
              aria-label={t.label}
            />
          ))}
        </div>
      </div>

      <div className="sheet__row toggle-row">
        <span className="sheet__label" style={{ marginBottom: 0 }}>
          ダークモード
        </span>
        <button
          className={'switch' + (settings.dark ? ' switch--on' : '')}
          onClick={() => onChange({ ...settings, dark: !settings.dark })}
          aria-pressed={settings.dark}
          aria-label="ダークモード切り替え"
        />
      </div>

      <button className="btn btn--ghost" onClick={onClose}>
        閉じる
      </button>
    </Sheet>
  )
}
