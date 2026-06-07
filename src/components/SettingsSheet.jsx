import Sheet from './Sheet.jsx'
import { THEMES } from '../lib/themes.js'

export default function SettingsSheet({
  settings,
  onChange,
  onClose,
  install,
  profile,
  onProfileChange,
  onToggleNotify,
}) {
  return (
    <Sheet title="設定" onClose={onClose}>
      <div className="sheet__row">
        <span className="sheet__label">あなたの名前（共有時に表示されます）</span>
        <input
          className="sheet__input"
          value={profile.name}
          onChange={(e) => onProfileChange({ ...profile, name: e.target.value })}
          placeholder="例: パパ / ママ"
          maxLength={20}
          aria-label="あなたの名前"
        />
      </div>

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

      <div className="sheet__row toggle-row">
        <span className="sheet__label" style={{ marginBottom: 0 }}>
          通知（共有相手の追加・購入済みを知らせる）
        </span>
        <button
          className={'switch' + (settings.notify ? ' switch--on' : '')}
          onClick={onToggleNotify}
          aria-pressed={!!settings.notify}
          aria-label="通知の切り替え"
        />
      </div>

      {install && !install.installed && (
        <div className="sheet__row">
          <span className="sheet__label">アプリ</span>
          {install.canInstall ? (
            <button className="btn btn--primary" onClick={install.promptInstall}>
              📲 ホーム画面に追加
            </button>
          ) : install.isIos ? (
            <p className="hint">
              Safari の共有ボタン <strong>􀈂</strong> →「ホーム画面に追加」で
              アプリとして使えます。
            </p>
          ) : (
            <p className="hint">
              ブラウザのメニューから「アプリをインストール」を選ぶと
              ホーム画面に追加できます。
            </p>
          )}
        </div>
      )}

      <button className="btn btn--ghost" onClick={onClose}>
        閉じる
      </button>
    </Sheet>
  )
}
