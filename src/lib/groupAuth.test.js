import { describe, it, expect, vi, beforeEach } from 'vitest'

// Firestore をインメモリのモックに差し替える（ネットワーク不要でロジックを検証）
const store = new Map()
vi.mock('firebase/firestore', () => ({
  doc: (_db, _col, id) => ({ id }),
  getDoc: async (ref) => {
    const data = store.get(ref.id)
    return { exists: () => data !== undefined, data: () => data }
  },
  setDoc: async (ref, data) => {
    store.set(ref.id, data)
  },
}))
vi.mock('./firebase.js', () => ({ getDb: () => ({}) }))
vi.mock('./boardApi.js', () => ({ seedLists: vi.fn(async () => {}) }))

import { normalizeGroupId, hashPassword, loginGroup } from './groupAuth.js'
import { seedLists } from './boardApi.js'

beforeEach(() => {
  store.clear()
  vi.clearAllMocks()
})

describe('normalizeGroupId', () => {
  it('前後の空白除去・小文字化・空白をハイフン化する', () => {
    expect(normalizeGroupId('  Tanaka Family  ')).toBe('tanaka-family')
  })
  it('空文字は弾く', () => {
    expect(() => normalizeGroupId('   ')).toThrow()
  })
  it('スラッシュは弾く', () => {
    expect(() => normalizeGroupId('a/b')).toThrow()
  })
})

describe('hashPassword', () => {
  it('決定的で64桁の16進を返す', async () => {
    const h1 = await hashPassword('g', 'secret')
    const h2 = await hashPassword('g', 'secret')
    expect(h1).toBe(h2)
    expect(h1).toMatch(/^[0-9a-f]{64}$/)
  })
  it('グループ名（salt）が違えばハッシュも変わる', async () => {
    const a = await hashPassword('group-a', 'secret')
    const b = await hashPassword('group-b', 'secret')
    expect(a).not.toBe(b)
  })
})

describe('loginGroup', () => {
  it('未使用のグループ名なら新規作成してオーナーを記録しリストを引き継ぐ', async () => {
    const res = await loginGroup({
      groupId: '田中家',
      password: 'aikotoba',
      lists: [{ id: 'l1', name: '食料品', items: [] }],
      ownerId: 'me',
    })
    expect(res).toEqual({ boardId: '田中家', created: true })
    expect(store.get('田中家').ownerId).toBe('me')
    expect(store.get('田中家').authHash).toMatch(/^[0-9a-f]{64}$/)
    expect(store.get('田中家').groupName).toBe('田中家')
    expect(seedLists).toHaveBeenCalledTimes(1)
  })

  it('既存グループに正しい合言葉で参加できる', async () => {
    await loginGroup({ groupId: 'family', password: 'pw', ownerId: 'a' })
    const res = await loginGroup({ groupId: 'family', password: 'pw', ownerId: 'b' })
    expect(res).toEqual({ boardId: 'family', created: false })
  })

  it('合言葉が違うと参加できない', async () => {
    await loginGroup({ groupId: 'family', password: 'right', ownerId: 'a' })
    await expect(
      loginGroup({ groupId: 'family', password: 'wrong', ownerId: 'b' }),
    ).rejects.toThrow('合言葉が違います')
  })

  it('authHash の無い既存ボード（招待リンク方式）には合言葉ログインできない', async () => {
    store.set('legacy', { createdAt: 1, ownerId: 'x' }) // authHash なし
    await expect(
      loginGroup({ groupId: 'legacy', password: 'pw', ownerId: 'b' }),
    ).rejects.toThrow()
  })

  it('合言葉が空ならエラー', async () => {
    await expect(loginGroup({ groupId: 'g', password: '' })).rejects.toThrow()
  })
})
