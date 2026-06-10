import { useState, useEffect } from 'react'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { getAuth } from '../lib/firebase.js'

export function useAnonymousAuth() {
  const [uid, setUid] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getAuth()
    if (!auth) {
      setLoading(false)
      return
    }
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid)
        setLoading(false)
      } else {
        try {
          const { user: u } = await signInAnonymously(auth)
          setUid(u.uid)
        } catch (err) {
          console.error('匿名ログイン失敗', err)
        } finally {
          setLoading(false)
        }
      }
    })
  }, [])

  return { uid, loading }
}
