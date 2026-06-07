import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage.js'

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns a plain initial value when storage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('k', { a: 1 }))
    expect(result.current[0]).toEqual({ a: 1 })
  })

  it('runs a function initial value lazily (regression: state was a function)', () => {
    const factory = () => ({ lists: [{ id: 'x', items: [] }] })
    const { result } = renderHook(() => useLocalStorage('k', factory))
    // 関数そのものではなく、実行結果が返ること
    expect(typeof result.current[0]).toBe('object')
    expect(result.current[0].lists[0].id).toBe('x')
  })

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0))
    act(() => result.current[1](5))
    expect(result.current[0]).toBe(5)
    expect(JSON.parse(window.localStorage.getItem('k'))).toBe(5)
  })

  it('reads an existing stored value over the initial value', () => {
    window.localStorage.setItem('k', JSON.stringify({ a: 99 }))
    const { result } = renderHook(() => useLocalStorage('k', { a: 1 }))
    expect(result.current[0]).toEqual({ a: 99 })
  })
})
