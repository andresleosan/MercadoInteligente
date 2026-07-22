import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addDoc, getDocs, getDoc, setDoc } from 'firebase/firestore'
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
})
