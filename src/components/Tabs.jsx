export default function Tabs({ lists, activeId, onSelect, onAdd }) {
  return (
    <div className="tabs" role="tablist">
      {lists.map((l) => (
        <button
          key={l.id}
          role="tab"
          aria-selected={l.id === activeId}
          className={'tab' + (l.id === activeId ? ' tab--active' : '')}
          onClick={() => onSelect(l.id)}
        >
          {l.name}
        </button>
      ))}
      <button className="tab tab--add" onClick={onAdd} aria-label="リストを追加">
        ＋
      </button>
    </div>
  )
}
