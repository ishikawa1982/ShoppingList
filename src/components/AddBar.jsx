import { useState } from 'react'

export default function AddBar({ onAdd }) {
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name, qty)
    setName('')
    setQty('')
  }

  return (
    <form className="add-bar" onSubmit={submit}>
      <input
        className="add-bar__name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="買うものを追加"
        aria-label="品名"
        enterKeyHint="done"
      />
      <input
        className="add-bar__qty"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder="数量"
        aria-label="数量"
      />
      <button className="add-bar__submit" type="submit" aria-label="追加">
        +
      </button>
    </form>
  )
}
