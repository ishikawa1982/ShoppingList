import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useChangeNotifications } from './useChangeNotifications.js'
import * as notify from '../lib/notify.js'

const list = (items) => [{ id: 'l1', name: '買い物', items }]

describe('useChangeNotifications', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(notify, 'showNotification').mockImplementation(() => {})
  })

  const opts = { enabled: true, clientId: 'me', boardId: 'b1' }

  it('最初のスナップショットでは通知しない', () => {
    renderHook(({ lists }) => useChangeNotifications(lists, opts), {
      initialProps: { lists: list([{ id: 'i1', name: '牛乳', byId: 'other' }]) },
    })
    expect(notify.showNotification).not.toHaveBeenCalled()
  })

  it('他人が追加した品物を通知する', () => {
    const { rerender } = renderHook(
      ({ lists }) => useChangeNotifications(lists, opts),
      { initialProps: { lists: list([]) } },
    )
    rerender({ lists: list([{ id: 'i1', name: '牛乳', by: 'ママ', byId: 'other' }]) })
    expect(notify.showNotification).toHaveBeenCalledWith(
      'かいものリスト',
      'ママさんが「牛乳」を追加しました',
    )
  })

  it('自分が追加した品物は通知しない', () => {
    const { rerender } = renderHook(
      ({ lists }) => useChangeNotifications(lists, opts),
      { initialProps: { lists: list([]) } },
    )
    rerender({ lists: list([{ id: 'i1', name: '牛乳', by: '私', byId: 'me' }]) })
    expect(notify.showNotification).not.toHaveBeenCalled()
  })

  it('他人が購入済みにしたら通知する', () => {
    const { rerender } = renderHook(
      ({ lists }) => useChangeNotifications(lists, opts),
      {
        initialProps: {
          lists: list([{ id: 'i1', name: '牛乳', checked: false }]),
        },
      },
    )
    rerender({
      lists: list([
        { id: 'i1', name: '牛乳', checked: true, checkedBy: 'パパ', checkedById: 'other' },
      ]),
    })
    expect(notify.showNotification).toHaveBeenCalledWith(
      'かいものリスト',
      'パパさんが「牛乳」を購入済みにしました',
    )
  })

  it('無効時は通知しない', () => {
    const { rerender } = renderHook(
      ({ lists }) => useChangeNotifications(lists, { ...opts, enabled: false }),
      { initialProps: { lists: list([]) } },
    )
    rerender({ lists: list([{ id: 'i1', name: '牛乳', byId: 'other' }]) })
    expect(notify.showNotification).not.toHaveBeenCalled()
  })
})
