import { useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import * as store from '../lib/store.js'

/**
 * localStorage 上の買い物リスト（共有しないモード）。
 * useCloudBoard と同じインターフェイスを返すので App から差し替え可能。
 */
export function useLocalBoard() {
  const [state, setState] = useLocalStorage('shopping.state.v1', store.defaultState)

  const api = useMemo(
    () => ({
      ready: true,
      addList(name) {
        // id は事前生成して確実に返す（setState 内で副作用に頼らない）
        const list = store.createList(name)
        setState((s) => ({ ...s, lists: [...s.lists, list] }))
        return list.id
      },
      renameList: (listId, name) =>
        setState((s) => store.renameList(s, listId, name)),
      removeList: (listId) => setState((s) => store.removeList(s, listId)),
      addItem: (listId, name, imageDataUrl) =>
        setState((s) => store.addItem(s, listId, name, imageDataUrl)),
      toggleItem: (listId, itemId) =>
        setState((s) => store.toggleItem(s, listId, itemId)),
      editItem: (listId, itemId, patch) =>
        setState((s) => store.editItem(s, listId, itemId, patch)),
      removeItem: (listId, itemId) =>
        setState((s) => store.removeItem(s, listId, itemId)),
      clearChecked: (listId) => setState((s) => store.clearChecked(s, listId)),
      reorderItems: (listId, from, to) =>
        setState((s) => store.reorderItems(s, listId, from, to)),
      // 共有を解除してクラウドの内容をローカルへ戻すときに使う
      replaceAll: (lists) => setState({ lists }),
    }),
    [setState],
  )

  return { lists: state.lists, ...api }
}
