import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addPurchase, getPurchases, deletePurchase, getTotalSpent } from './purchases'
import { collection, doc, addDoc, getDocs, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore'

vi.mock('firebase/firestore')
vi.mock('@/config/firebase', () => ({
  db: {},
  isConfigValid: true,
}))

describe('Purchases Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addPurchase', () => {
    it('should add purchase and return it', async () => {
      const items = [
        { name: 'Leche', quantity: 2, unitPrice: 1000, totalPrice: 2000 },
        { name: 'Pan', quantity: 1, unitPrice: 500, totalPrice: 500 },
      ]
      
      vi.mocked(addDoc).mockResolvedValue({
        id: 'purchase-id',
      } as any)

      const result = await addPurchase('user-id', items)

      expect(addDoc).toHaveBeenCalled()
      expect(result.id).toBe('purchase-id')
      expect(result.total).toBe(2500)
      expect(result.items).toEqual(items)
    })
  })

  describe('getPurchases', () => {
    it('should return purchases for current month', async () => {
      const mockDocs = [
        {
          id: 'purchase-1',
          data: () => ({
            userId: 'user-id',
            items: [{ name: 'Leche', quantity: 2, unitPrice: 1000, totalPrice: 2000 }],
            total: 2000,
            createdAt: { toDate: () => new Date() },
          }),
        },
      ]
      
      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as any)

      const result = await getPurchases('user-id', '2026-07')

      expect(result).toHaveLength(1)
      expect(result[0].total).toBe(2000)
    })

    it('should use Timestamp for date queries', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any)

      await getPurchases('user-id', '2026-07')

      expect(Timestamp.fromDate).toHaveBeenCalled()
    })
  })

  describe('deletePurchase', () => {
    it('should delete purchase', async () => {
      vi.mocked(deleteDoc).mockResolvedValue(undefined)

      await deletePurchase('user-id', 'purchase-id')

      expect(deleteDoc).toHaveBeenCalled()
    })
  })

  describe('getTotalSpent', () => {
    it('should return sum of all purchases', async () => {
      const mockDocs = [
        {
          data: () => ({
            total: 2000,
            createdAt: { toDate: () => new Date() },
          }),
        },
        {
          data: () => ({
            total: 3000,
            createdAt: { toDate: () => new Date() },
          }),
        },
      ]
      
      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as any)

      const result = await getTotalSpent('user-id', '2026-07')

      expect(result).toBe(5000)
    })

    it('should return 0 if no purchases', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any)

      const result = await getTotalSpent('user-id', '2026-07')

      expect(result).toBe(0)
    })
  })
})
