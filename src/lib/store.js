// 買い物リストの状態を操作する純粋関数群。
// React に依存しないので単体テストしやすい。

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function createItem(name, qty = '') {
  return {
    id: uid(),
    name: name.trim(),
    qty: qty.trim(),
    checked: false,
    createdAt: Date.now(),
  }
}

export function createList(name) {
  return { id: uid(), name: name.trim() || '新しいリスト', items: [] }
}

export const defaultState = () => ({
  lists: [
    {
      id: uid(),
      name: '買い物',
      items: [
        createItem('牛乳', '1本'),
        createItem('たまご', '1パック'),
        createItem('パン'),
      ],
    },
  ],
})

// --- リスト操作 ---

export function addList(state, name) {
  const list = createList(name)
  return { state: { ...state, lists: [...state.lists, list] }, list }
}

export function renameList(state, listId, name) {
  return {
    ...state,
    lists: state.lists.map((l) =>
      l.id === listId ? { ...l, name: name.trim() || l.name } : l,
    ),
  }
}

export function removeList(state, listId) {
  return { ...state, lists: state.lists.filter((l) => l.id !== listId) }
}

// --- アイテム操作 ---

function mapList(state, listId, fn) {
  return {
    ...state,
    lists: state.lists.map((l) => (l.id === listId ? fn(l) : l)),
  }
}

export function addItem(state, listId, name, qty) {
  if (!name.trim()) return state
  return mapList(state, listId, (l) => ({
    ...l,
    items: [createItem(name, qty), ...l.items],
  }))
}

export function toggleItem(state, listId, itemId) {
  return mapList(state, listId, (l) => ({
    ...l,
    items: l.items.map((it) =>
      it.id === itemId ? { ...it, checked: !it.checked } : it,
    ),
  }))
}

export function editItem(state, listId, itemId, patch) {
  return mapList(state, listId, (l) => ({
    ...l,
    items: l.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
  }))
}

export function removeItem(state, listId, itemId) {
  return mapList(state, listId, (l) => ({
    ...l,
    items: l.items.filter((it) => it.id !== itemId),
  }))
}

export function clearChecked(state, listId) {
  return mapList(state, listId, (l) => ({
    ...l,
    items: l.items.filter((it) => !it.checked),
  }))
}

// チェック済みを下に、未チェックを上に並べ替えた配列を返す。
export function sortedItems(items) {
  return [...items].sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1
    return b.createdAt - a.createdAt
  })
}
