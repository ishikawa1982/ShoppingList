import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { getDb } from '../lib/firebase.js'
import { createItem, createList } from '../lib/store.js'

/**
 * Firestore 上の共有ボードをリアルタイム購読する。
 * boardId が null のときは何もしない（ローカルモード時）。
 * useLocalBoard と同じインターフェイスを返す。
 */
export function useCloudBoard(boardId) {
  const [lists, setLists] = useState([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!boardId) {
      setLists([])
      setReady(false)
      setError(null)
      return
    }
    const db = getDb()
    if (!db) {
      setError('Firebase が未設定です')
      setReady(true)
      return
    }
    setReady(false)
    setError(null)
    const col = collection(db, 'boards', boardId, 'lists')
    const unsub = onSnapshot(
      col,
      (snap) => {
        const arr = snap.docs.map((d) => {
          const data = d.data()
          const items = Object.entries(data.items || {}).map(([id, v]) => ({
            id,
            ...v,
          }))
          return {
            id: d.id,
            name: data.name || 'リスト',
            order: data.order || 0,
            items,
          }
        })
        arr.sort((a, b) => a.order - b.order)
        setLists(arr)
        setReady(true)
      },
      (err) => {
        console.error('クラウド同期エラー', err)
        setError(err.message || '同期に失敗しました')
        setReady(true)
      },
    )
    return unsub
  }, [boardId])

  const api = useMemo(() => {
    const listRef = (listId) => doc(getDb(), 'boards', boardId, 'lists', listId)
    return {
      addList(name) {
        const list = createList(name)
        setDoc(listRef(list.id), {
          name: list.name,
          order: Date.now(),
          items: {},
        })
        return list.id
      },
      renameList(listId, name) {
        if (!name.trim()) return
        updateDoc(listRef(listId), { name: name.trim() })
      },
      removeList(listId) {
        deleteDoc(listRef(listId))
      },
      addItem(listId, name, qty) {
        if (!name.trim()) return
        const { id, ...rest } = createItem(name, qty)
        updateDoc(listRef(listId), { [`items.${id}`]: rest })
      },
      toggleItem(listId, itemId) {
        const it = lists
          .find((l) => l.id === listId)
          ?.items.find((i) => i.id === itemId)
        updateDoc(listRef(listId), {
          [`items.${itemId}.checked`]: !it?.checked,
        })
      },
      editItem(listId, itemId, patch) {
        const updates = {}
        for (const [k, v] of Object.entries(patch)) {
          updates[`items.${itemId}.${k}`] = v
        }
        updateDoc(listRef(listId), updates)
      },
      removeItem(listId, itemId) {
        updateDoc(listRef(listId), { [`items.${itemId}`]: deleteField() })
      },
      clearChecked(listId) {
        const l = lists.find((x) => x.id === listId)
        if (!l) return
        const updates = {}
        l.items
          .filter((i) => i.checked)
          .forEach((i) => {
            updates[`items.${i.id}`] = deleteField()
          })
        if (Object.keys(updates).length) updateDoc(listRef(listId), updates)
      },
    }
  }, [boardId, lists])

  return { lists, ready, error, ...api }
}
