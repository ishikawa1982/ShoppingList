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
import { logActivity } from '../lib/activityApi.js'
import { createItem, createList } from '../lib/store.js'

/**
 * Firestore 上の共有ボードをリアルタイム購読する。
 * boardId が null のときは何もしない（ローカルモード時）。
 * actor は操作者の表示名（誰がやったかの記録に使う）。
 * useLocalBoard と同じインターフェイスを返す。
 */
export function useCloudBoard(boardId, actor = '名無し', actorId = null) {
  const [lists, setLists] = useState([])
  const [ownerId, setOwnerId] = useState(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!boardId) {
      setLists([])
      setOwnerId(null)
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
    // ボードのメタ情報（ownerId など）を購読
    const unsubBoard = onSnapshot(
      doc(db, 'boards', boardId),
      (d) => setOwnerId(d.exists() ? d.data().ownerId ?? null : null),
      (err) => console.warn('ボード情報の取得に失敗', err),
    )
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
    return () => {
      unsubBoard()
      unsub()
    }
  }, [boardId])

  const api = useMemo(() => {
    const listRef = (listId) => doc(getDb(), 'boards', boardId, 'lists', listId)
    const listName = (listId) =>
      lists.find((l) => l.id === listId)?.name || 'リスト'
    const log = (type, fields) => logActivity(boardId, { type, by: actor, ...fields })

    return {
      addList(name) {
        const list = createList(name)
        setDoc(listRef(list.id), {
          name: list.name,
          order: Date.now(),
          items: {},
        })
        log('addList', { listName: list.name })
        return list.id
      },
      renameList(listId, name) {
        if (!name.trim()) return
        updateDoc(listRef(listId), { name: name.trim() })
        log('renameList', { listName: name.trim() })
      },
      removeList(listId) {
        const name = listName(listId)
        deleteDoc(listRef(listId))
        log('removeList', { listName: name })
      },
      addItem(listId, name, qty) {
        if (!name.trim()) return
        const { id, ...rest } = createItem(name, qty)
        rest.by = actor
        rest.byId = actorId
        updateDoc(listRef(listId), { [`items.${id}`]: rest })
        log('add', { itemName: rest.name, listName: listName(listId) })
      },
      toggleItem(listId, itemId) {
        const it = lists
          .find((l) => l.id === listId)
          ?.items.find((i) => i.id === itemId)
        const next = !it?.checked
        updateDoc(listRef(listId), {
          [`items.${itemId}.checked`]: next,
          [`items.${itemId}.checkedBy`]: next ? actor : deleteField(),
          [`items.${itemId}.checkedById`]: next ? actorId : deleteField(),
        })
        log(next ? 'check' : 'uncheck', {
          itemName: it?.name || '',
          listName: listName(listId),
        })
      },
      editItem(listId, itemId, patch) {
        const updates = {}
        for (const [k, v] of Object.entries(patch)) {
          updates[`items.${itemId}.${k}`] = v
        }
        updateDoc(listRef(listId), updates)
        if (patch.name) {
          log('edit', { itemName: patch.name, listName: listName(listId) })
        }
      },
      removeItem(listId, itemId) {
        const it = lists
          .find((l) => l.id === listId)
          ?.items.find((i) => i.id === itemId)
        updateDoc(listRef(listId), { [`items.${itemId}`]: deleteField() })
        log('delete', {
          itemName: it?.name || '',
          listName: listName(listId),
        })
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
        if (Object.keys(updates).length) {
          updateDoc(listRef(listId), updates)
          log('clear', { listName: l.name })
        }
      },
    }
  }, [boardId, lists, actor, actorId])

  return { lists, ownerId, ready, error, ...api }
}
