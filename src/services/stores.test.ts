import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addDoc, arrayUnion, getDocs, getDoc, setDoc } from 'firebase/firestore'
import { createStore, getStores } from './stores'

vi.mock('firebase/firestore')
vi.mock('@/config/firebase', () => ({
  db: {},
}))

describe('Stores Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('falls back to embedded user data when subcollection write is denied', async () => {
    vi.mocked(addDoc).mockRejectedValue({ code: 'permission-denied' } as any)
    vi.mocked(setDoc).mockResolvedValue(undefined)

    const store = await createStore('user-1', { name: 'Éxito' })

    expect(store.userId).toBe('user-1')
    expect(store.name).toBe('Éxito')
    expect(setDoc).toHaveBeenCalled()
  })

  it('serializes embedded stores without undefined fields', async () => {
    vi.mocked(addDoc).mockRejectedValue({ code: 'permission-denied' } as any)
    vi.mocked(setDoc).mockResolvedValue(undefined)

    await createStore('user-1', { name: 'Éxito' })

    expect(vi.mocked(arrayUnion).mock.calls[0]?.[0]).toEqual({
      id: expect.any(String),
      userId: 'user-1',
      name: 'Éxito',
      createdAt: expect.any(String),
    })
  })

  it('merges embedded stores when listing', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any)
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        storeEntries: [
          {
            id: 'store-1',
            userId: 'user-1',
            name: 'Éxito',
            createdAt: '2026-07-21T00:00:00.000Z',
          },
        ],
      }),
    } as any)

    const stores = await getStores('user-1')

    expect(stores).toHaveLength(1)
    expect(stores[0].id).toBe('store-1')
    expect(stores[0].name).toBe('Éxito')
  })

  it('returns embedded stores when the subcollection read is denied', async () => {
    vi.mocked(getDocs).mockRejectedValue({ code: 'permission-denied' } as any)
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        storeEntries: [
          {
            id: 'store-2',
            userId: 'user-1',
            name: 'Carulla',
            createdAt: '2026-07-21T00:00:00.000Z',
          },
        ],
      }),
    } as any)

    const stores = await getStores('user-1')

    expect(stores).toHaveLength(1)
    expect(stores[0].id).toBe('store-2')
    expect(stores[0].name).toBe('Carulla')
  })
})
