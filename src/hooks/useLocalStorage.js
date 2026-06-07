import { useCallback, useEffect, useState } from 'react'

/**
 * localStorage に同期する useState。
 * 別タブでの変更も storage イベントで反映する（簡易共有の足がかり）。
 */
export function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (err) {
      console.warn(`useLocalStorage: "${key}" の読み込みに失敗しました`, err)
      return initialValue
    }
  }, [key, initialValue])

  const [storedValue, setStoredValue] = useState(readValue)

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch (err) {
          console.warn(`useLocalStorage: "${key}" の保存に失敗しました`, err)
        }
        return next
      })
    },
    [key],
  )

  // 別タブからの変更を購読
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key) setStoredValue(readValue())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, readValue])

  return [storedValue, setValue]
}
