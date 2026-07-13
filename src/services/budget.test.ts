import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBudget, setBudget, getAllBudgets } from './budget'
import { doc, setDoc, getDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'

vi.mock('firebase/firestore')
vi.mock('@/config/firebase', () => ({
  db: {},
  isConfigValid: true,
}))

describe('Budget Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBudget', () => {
    it('should return null if budget does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any)

      const result = await getBudget('user-id', '2026-07')

      expect(result).toBeNull()
    })

    it('should return budget if exists', async () => {
      const mockBudget = {
        userId: 'user-id',
        month: '2026-07',
        amount: 50000,
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      }
      
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: '2026-07',
        data: () => mockBudget,
      } as any)

      const result = await getBudget('user-id', '2026-07')

      expect(result).not.toBeNull()
      expect(result?.amount).toBe(50000)
      expect(result?.month).toBe('2026-07')
    })

    it('should use current month if not specified', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any)

      await getBudget('user-id')

      expect(doc).toHaveBeenCalled()
    })
  })

  describe('setBudget', () => {
    it('should create new budget if not exists', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
        data: () => undefined,
      } as any)
      
      vi.mocked(setDoc).mockResolvedValue(undefined)

      const result = await setBudget('user-id', 50000, '2026-07')

      expect(setDoc).toHaveBeenCalled()
      expect(result.amount).toBe(50000)
      expect(result.month).toBe('2026-07')
    })

    it('should update existing budget', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          createdAt: { toDate: () => new Date() },
        }),
      } as any)
      
      vi.mocked(setDoc).mockResolvedValue(undefined)

      const result = await setBudget('user-id', 60000, '2026-07')

      expect(result.amount).toBe(60000)
    })
  })

  describe('getAllBudgets', () => {
    it('should return all budgets', async () => {
      const mockDocs = [
        {
          id: '2026-07',
          data: () => ({
            userId: 'user-id',
            month: '2026-07',
            amount: 50000,
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
        {
          id: '2026-06',
          data: () => ({
            userId: 'user-id',
            month: '2026-06',
            amount: 45000,
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ]
      
      vi.mocked(getDocs).mockResolvedValue({
        docs: mockDocs,
      } as any)

      const result = await getAllBudgets('user-id')

      expect(result).toHaveLength(2)
      expect(result[0].amount).toBe(50000)
      expect(result[1].amount).toBe(45000)
    })
  })
})
