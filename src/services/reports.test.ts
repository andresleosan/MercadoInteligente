import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  formatMonthLabel,
  shiftMonth,
  getCategorySpending,
  getMonthlyComparison,
  getMonthlyTrends,
} from './reports'
import { getPurchases } from '@/services/purchases'
import { getBudgetsByMonthRange } from '@/services/budget'
import { getCategories } from '@/services/categories'
import { getTotalSpentByMonth } from '@/services/analytics'

vi.mock('@/services/purchases', () => ({
  getPurchases: vi.fn(),
}))

vi.mock('@/services/budget', () => ({
  getBudgetsByMonthRange: vi.fn(),
}))

vi.mock('@/services/categories', () => ({
  getCategories: vi.fn(),
}))

vi.mock('@/services/analytics', () => ({
  getTotalSpentByMonth: vi.fn(),
}))

describe('reports service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('utility functions', () => {
    it('formatMonthLabel formats valid YYYY-MM into Spanish string', () => {
      expect(formatMonthLabel('2026-07')).toBe('Julio 2026')
      expect(formatMonthLabel('2026-01')).toBe('Enero 2026')
      expect(formatMonthLabel('2026-12')).toBe('Diciembre 2026')
    })

    it('shiftMonth shifts positive and negative months across year boundary', () => {
      expect(shiftMonth('2026-07', -1)).toBe('2026-06')
      expect(shiftMonth('2026-01', -1)).toBe('2025-12')
      expect(shiftMonth('2025-12', 1)).toBe('2026-01')
      expect(shiftMonth('2026-07', 3)).toBe('2026-10')
    })
  })

  describe('getCategorySpending', () => {
    it('calculates category spending, items count and percentages correctly', async () => {
      vi.mocked(getCategories).mockResolvedValue([
        { id: 'lacteos', name: 'Lácteos', icon: 'milk', isDefault: true },
        { id: 'carnes', name: 'Carnes', icon: 'beef', isDefault: true },
      ])

      vi.mocked(getPurchases).mockResolvedValue([
        {
          id: 'p1',
          userId: 'u1',
          storeId: 's1',
          storeName: 'Exito',
          purchaseDate: '2026-07-10',
          total: 100,
          createdAt: new Date('2026-07-10'),
          items: [
            { name: 'Leche', quantity: 2, unitPrice: 20, totalPrice: 40, category: 'lacteos' },
            { name: 'Carne', quantity: 1, unitPrice: 60, totalPrice: 60, category: 'carnes' },
          ],
        },
        {
          id: 'p2',
          userId: 'u1',
          storeId: 's1',
          storeName: 'D1',
          purchaseDate: '2026-07-12',
          total: 50,
          createdAt: new Date('2026-07-12'),
          items: [
            { name: 'Yogurt', quantity: 1, unitPrice: 20, totalPrice: 20, category: 'lacteos' },
            { name: 'Desconocido', quantity: 1, unitPrice: 30, totalPrice: 30 }, // defaults to 'otro'
          ],
        },
      ])

      const result = await getCategorySpending('u1', '2026-07')

      expect(result).toHaveLength(3)
      // Total items = 40 + 60 + 20 + 30 = 150
      // carnes: 60 (40%)
      // lacteos: 60 (40%)
      // otro: 30 (20%)
      expect(result[0]!.total).toBe(60)
      expect(result[1]!.total).toBe(60)
      expect(result[2]!.categoryId).toBe('otro')
      expect(result[2]!.total).toBe(30)
      expect(result[2]!.percentage).toBe(20)
    })

    it('returns empty array when there are no purchases', async () => {
      vi.mocked(getCategories).mockResolvedValue([])
      vi.mocked(getPurchases).mockResolvedValue([])

      const result = await getCategorySpending('u1', '2026-07')
      expect(result).toEqual([])
    })
  })

  describe('getMonthlyComparison', () => {
    it('compares current vs previous month and budget', async () => {
      vi.mocked(getCategories).mockResolvedValue([
        { id: 'lacteos', name: 'Lácteos', icon: 'milk', isDefault: true },
      ])

      vi.mocked(getPurchases).mockImplementation(async (_uid, month) => {
        if (month === '2026-07') {
          return [
            {
              id: 'p1',
              userId: 'u1',
              storeId: 's1',
              storeName: 'Exito',
              purchaseDate: '2026-07-05',
              total: 120,
              createdAt: new Date('2026-07-05'),
              items: [{ name: 'Queso', quantity: 2, unitPrice: 60, totalPrice: 120, category: 'lacteos' }],
            },
            {
              id: 'p2',
              userId: 'u1',
              storeId: 's1',
              storeName: 'Jumbo',
              purchaseDate: '2026-07-15',
              total: 80,
              createdAt: new Date('2026-07-15'),
              items: [{ name: 'Leche', quantity: 2, unitPrice: 40, totalPrice: 80, category: 'lacteos' }],
            },
          ]
        }
        if (month === '2026-06') {
          return [
            {
              id: 'p0',
              userId: 'u1',
              storeId: 's1',
              storeName: 'Exito',
              purchaseDate: '2026-06-10',
              total: 100,
              createdAt: new Date('2026-06-10'),
              items: [{ name: 'Queso', quantity: 1, unitPrice: 100, totalPrice: 100, category: 'lacteos' }],
            },
          ]
        }
        return []
      })

      const budgetMap = new Map<string, number>()
      budgetMap.set('2026-07', 300)
      vi.mocked(getBudgetsByMonthRange).mockResolvedValue(budgetMap)

      const comparison = await getMonthlyComparison('u1', '2026-07')

      expect(comparison.currentSpent).toBe(200) // 120 + 80
      expect(comparison.previousSpent).toBe(100)
      expect(comparison.previousMonth).toBe('2026-06')
      expect(comparison.difference).toBe(100) // 200 - 100
      expect(comparison.percentageChange).toBe(100) // +100%
      expect(comparison.currentBudget).toBe(300)
      expect(comparison.savingsOrDeficit).toBe(100) // 300 - 200 = 100 savings
      expect(comparison.purchaseCount).toBe(2)
      expect(comparison.averageTicket).toBe(100) // 200 / 2
      expect(comparison.topCategory?.categoryName).toBe('Lácteos')
    })

    it('handles 0 spent in previous month correctly', async () => {
      vi.mocked(getCategories).mockResolvedValue([])
      vi.mocked(getPurchases).mockImplementation(async (_uid, month) => {
        if (month === '2026-07') {
          return [
            {
              id: 'p1',
              userId: 'u1',
              storeId: 's1',
              storeName: 'Exito',
              purchaseDate: '2026-07-05',
              total: 50,
              createdAt: new Date('2026-07-05'),
              items: [],
            },
          ]
        }
        return []
      })
      vi.mocked(getBudgetsByMonthRange).mockResolvedValue(new Map())

      const comparison = await getMonthlyComparison('u1', '2026-07')
      expect(comparison.currentSpent).toBe(50)
      expect(comparison.previousSpent).toBe(0)
      expect(comparison.percentageChange).toBe(100)
      expect(comparison.currentBudget).toBeNull()
      expect(comparison.savingsOrDeficit).toBeNull()
    })
  })

  describe('getMonthlyTrends', () => {
    it('returns formatted monthly trend data', async () => {
      vi.mocked(getTotalSpentByMonth).mockResolvedValue([
        { month: '2026-05', spent: 150, budget: 200 },
        { month: '2026-06', spent: 180, budget: 200 },
        { month: '2026-07', spent: 210, budget: 200 },
      ])

      const trends = await getMonthlyTrends('u1', 3, '2026-07')
      expect(trends).toHaveLength(3)
      expect(trends[0]!.monthLabel).toBe('Mayo 2026')
      expect(trends[0]!.spent).toBe(150)
      expect(trends[1]!.monthLabel).toBe('Junio 2026')
      expect(trends[2]!.monthLabel).toBe('Julio 2026')
    })
  })
})

