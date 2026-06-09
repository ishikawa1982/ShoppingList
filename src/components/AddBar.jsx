import { useRef, useState } from 'react'

async function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 800
      const scale = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.src = url
  })
}

export default function AddBar({ onAdd }) {
  const [name, setName] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const fileRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await compressImage(file)
    setImageDataUrl(dataUrl)
    e.target.value = ''
  }

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name, imageDataUrl)
    setName('')
    setImageDataUrl(null)
  }

  return (
    <form className="add-bar" onSubmit={submit}>
      <div className="add-bar__top">
        <input
          className="add-bar__name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="買うものを追加"
          aria-label="品名"
          enterKeyHint="done"
        />
        <button
          type="button"
          className="add-bar__img-btn"
          onClick={() => fileRef.current?.click()}
          aria-label="画像を添付"
          title="画像を添付"
        >
          📷
        </button>
        <button className="add-bar__submit" type="submit" aria-label="追加">
          +
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      {imageDataUrl && (
        <div className="add-bar__preview">
          <img src={imageDataUrl} className="add-bar__preview-img" alt="プレビュー" />
          <button
            type="button"
            className="add-bar__preview-clear"
            onClick={() => setImageDataUrl(null)}
            aria-label="画像を削除"
          >
            ✕
          </button>
        </div>
      )}
    </form>
  )
}
