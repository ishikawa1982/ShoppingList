import { describe, it, expect } from 'vitest'
import {
  addItem,
  addList,
  clearChecked,
  defaultState,
  editItem,
  removeItem,
  removeList,
  renameList,
  sortedItems,
  toggleItem,
} from './store.js'

function freshState() {
  return { lists: [{ id: 'l1', name: '買い物', items: [] }] }
}

describe('item operations', () => {
  it('adds an item to the top of the list', () => {
    const s = addItem(freshState(), 'l1', '牛乳', null)
    expect(s.lists[0].items).toHaveLength(1)
    expect(s.lists[0].items[0]).toMatchObject({ name: '牛乳', imageDataUrl: null, checked: false })
  })

  it('ignores empty item names', () => {
    const s = addItem(freshState(), 'l1', '   ', '')
    expect(s.lists[0].items).toHaveLength(0)
  })

  it('toggles checked state', () => {
    let s = addItem(freshState(), 'l1', 'パン')
    const id = s.lists[0].items[0].id
    s = toggleItem(s, 'l1', id)
    expect(s.lists[0].items[0].checked).toBe(true)
    s = toggleItem(s, 'l1', id)
    expect(s.lists[0].items[0].checked).toBe(false)
  })

  it('edits an item name', () => {
    let s = addItem(freshState(), 'l1', 'パン')
    const id = s.lists[0].items[0].id
    s = editItem(s, 'l1', id, { name: '食パン' })
    expect(s.lists[0].items[0].name).toBe('食パン')
  })

  it('removes an item', () => {
    let s = addItem(freshState(), 'l1', 'パン')
    const id = s.lists[0].items[0].id
    s = removeItem(s, 'l1', id)
    expect(s.lists[0].items).toHaveLength(0)
  })

  it('clears only checked items', () => {
    let s = addItem(freshState(), 'l1', 'A')
    s = addItem(s, 'l1', 'B')
    const idA = s.lists[0].items.find((i) => i.name === 'A').id
    s = toggleItem(s, 'l1', idA)
    s = clearChecked(s, 'l1')
    expect(s.lists[0].items.map((i) => i.name)).toEqual(['B'])
  })
})

describe('list operations', () => {
  it('adds a list and returns it', () => {
    const { state, list } = addList(freshState(), '週末')
    expect(state.lists).toHaveLength(2)
    expect(list.name).toBe('週末')
  })

  it('falls back to a default name when blank', () => {
    const { list } = addList(freshState(), '   ')
    expect(list.name).toBe('新しいリスト')
  })

  it('renames a list', () => {
    const s = renameList(freshState(), 'l1', '食材')
    expect(s.lists[0].name).toBe('食材')
  })

  it('keeps the old name when renamed to blank', () => {
    const s = renameList(freshState(), 'l1', '   ')
    expect(s.lists[0].name).toBe('買い物')
  })

  it('removes a list', () => {
    const { state } = addList(freshState(), '週末')
    const s = removeList(state, 'l1')
    expect(s.lists).toHaveLength(1)
    expect(s.lists[0].name).toBe('週末')
  })
})

describe('sortedItems', () => {
  it('puts checked items below unchecked ones', () => {
    const items = [
      { id: 'a', name: 'A', checked: true, createdAt: 3 },
      { id: 'b', name: 'B', checked: false, createdAt: 2 },
      { id: 'c', name: 'C', checked: false, createdAt: 1 },
    ]
    const sorted = sortedItems(items)
    expect(sorted.map((i) => i.name)).toEqual(['B', 'C', 'A'])
  })
})

describe('defaultState', () => {
  it('creates a starter list with sample items', () => {
    const s = defaultState()
    expect(s.lists).toHaveLength(1)
    expect(s.lists[0].items.length).toBeGreaterThan(0)
  })
})
