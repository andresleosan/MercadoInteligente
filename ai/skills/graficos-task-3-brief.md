
- [ ] **Step 1: Write the failing test**

Crear `src/services/analytics.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTotalSpentByMonth, getTopProducts } from './analytics'
import type { Purchase } from '@/types'

vi.mock('@/services/purchases', () => ({
  getPurchasesByDateRange: vi.fn(),
  getPurchases: vi.fn(),
}))
vi.mock('@/services/budget', () => ({
  getBudgetsByMonthRange: vi.fn(),
}))

describe('analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTotalSpentByMonth', () => {
    it('should return 6 months of data with spent and budget', async () => {
      const { getPurchasesByDateRange } = await import('@/services/purchases')
      const { getBudgetsByMonthRange } = await import('@/services/budget')

      const mockPurchases: Purchase[] = [
        { id: '1', userId: 'u1', items: [], total: 10000, createdAt: new Date(2026, 6, 15) },
        { id: '2', userId: 'u1', items: [], total: 5000, createdAt: new Date(2026, 5, 10) },
      ]
      vi.mocked(getPurchasesByDateRange).mockResolvedValue(mockPurchases)

      const budgetMap = new Map([
        ['2026-07', 50000],
        ['2026-06', 45000],
      ])
      vi.mocked(getBudgetsByMonthRange).mockResolvedValue(budgetMap)

      const result = await getTotalSpentByMonth('u1', 6, '2026-07')

      expect(result).toHaveLength(6)
      expect(result[0]).toEqual({ month: '2026-02', spent: 0, budget: null })
      expect(result[5]).toEqual({ month: '2026-07', spent: 10000, budget: 50000 })
      expect(result[4]).toEqual({ month: '2026-06', spent: 5000, budget: 45000 })
    })

    it('should handle month with no purchases (spent=0)', async () => {
      const { getPurchasesByDateRange } = await import('@/services/purchases')
      const { getBudgetsByMonthRange } = await import('@/services/budget')

      vi.mocked(getPurchasesByDateRange).mockResolvedValue([])
      vi.mocked(getBudgetsByMonthRange).mockResolvedValue(new Map())

      const result = await getTotalSpentByMonth('u1', 3, '2026-07')

      expect(result).toHaveLength(3)
      expect(result.every((m) => m.spent === 0)).toBe(true)
      expect(result.every((m) => m.budget === null)).toBe(true)
    })

    it('should order months chronologically', async () => {
      const { getPurchasesByDateRange } = await import('@/services/purchases')
      const { getBudgetsByMonthRange } = await import('@/services/budget')

      vi.mocked(getPurchasesByDateRange).mockResolvedValue([])
      vi.mocked(getBudgetsByMonthRange).mockResolvedValue(new Map())

      const result = await getTotalSpentByMonth('u1', 3, '2026-07')

      expect(result[0].month).toBe('2026-05')
      expect(result[1].month).toBe('2026-06')
      expect(result[2].month).toBe('2026-07')
    })
  })

  describe('getTopProducts', () => {
    it('should group products by name case-insensitive and sum totals', async () => {
      const { getPurchases } = await import('@/services/purchases')
      const mockPurchases: Purchase[] = [
        {
          id: '1', userId: 'u1', total: 900,
          createdAt: new Date(2026, 6, 1),
          items: [
            { name: 'Leche', quantity: 2, unitPrice: 450, totalPrice: 900 },
          ],
        },
        {
          id: '2', userId: 'u1', total: 450,
          createdAt: new Date(2026, 6, 5),
          items: [
            { name: 'leche', quantity: 1, unitPrice: 450, totalPrice: 450 },
            { name: 'Pan', quantity: 1, unitPrice: 200, totalPrice: 200 },
          ],
        },
      ]
      vi.mocked(getPurchases).mockResolvedValue(mockPurchases)

      const result = await getTopProducts('u1', '2026-07', 5)

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Leche')
      expect(result[0].totalSpent).toBe(1350)
      expect(result[0].count).toBe(2)
      expect(result[1].name).toBe('Pan')
      expect(result[1].totalSpent).toBe(200)
      expect(result[1].count).toBe(1)
    })

    it('should order by totalSpent descending', async () => {
      const { getPurchases } = await import('@/services/purchases')
      const mockPurchases: Purchase[] = [
        {
          id: '1', userId: 'u1', total: 100,
          createdAt: new Date(2026, 6, 1),
          items: [
            { name: 'Caro', quantity: 1, unitPrice: 5000, totalPrice: 5000 },
            { name: 'Barato', quantity: 1, unitPrice: 100, totalPrice: 100 },
          ],
        },
      ]
      vi.mocked(getPurchases).mockResolvedValue(mockPurchases)

      const result = await getTopProducts('u1', '2026-07', 5)

      expect(result[0].name).toBe('Caro')
      expect(result[1].name).toBe('Barato')
    })

    it('should limit to 5 results', async () => {
      const { getPurchases } = await import('@/services/purchases')
      const items = Array.from({ length: 8 }, (_, i) => ({
        name: `Producto${i}`,
        quantity: 1,
        unitPrice: 100 * (8 - i),
        totalPrice: 100 * (8 - i),
      }))
      const mockPurchases: Purchase[] = [
        { id: '1', userId: 'u1', total: 3600, createdAt: new Date(2026, 6, 1), items },
      ]
      vi.mocked(getPurchases).mockResolvedValue(mockPurchases)

      const result = await getTopProducts('u1', '2026-07', 5)

      expect(result).toHaveLength(5)
      expect(result[0].name).toBe('Producto0')
    })

    it('should return empty array for month with no purchases', async () => {
      const { getPurchases } = await import('@/services/purchases')
      vi.mocked(getPurchases).mockResolvedValue([])

      const result = await getTopProducts('u1', '2026-07', 5)

      expect(result).toHaveLength(0)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/analytics.test.ts`
Expected: FAIL con `Cannot find module './analytics'`.

- [ ] **Step 3: Write minimal implementation**

Crear `src/services/analytics.ts`:

```ts
import { getPurchasesByDateRange, getPurchases } from '@/services/purchases'
import { getBudgetsByMonthRange } from '@/services/budget'
import type { Purchase } from '@/types'

export interface MonthData {
  month: string
  spent: number
  budget: number | null
}

export interface ProductData {
  name: string
  totalSpent: number
  count: number
}

function shiftMonth(month: string, delta: number): string {
  const [year, monthNum] = month.split('-').map(Number)
  const date = new Date(year!, monthNum! - 1, 1)
  date.setMonth(date.getMonth() + delta)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export async function getTotalSpentByMonth(
  userId: string,
  monthsBack: number,
  referenceMonth: string
): Promise<MonthData[]> {
  const startMonth = shiftMonth(referenceMonth, -(monthsBack - 1))
  const [startYear, startMonthNum] = startMonth.split('-').map(Number)
  const startDate = new Date(startYear!, startMonthNum! - 1, 1)

  const [refYear, refMonthNum] = referenceMonth.split('-').map(Number)
  const endDate = new Date(refYear!, refMonthNum!, 0, 23, 59, 59)

  const [purchases, budgetMap] = await Promise.all([
    getPurchasesByDateRange(userId, startDate, endDate),
    getBudgetsByMonthRange(userId, monthsBack, referenceMonth),
  ])

  const spentByMonth = new Map<string, number>()
  for (const purchase of purchases) {
    const purchaseMonth = `${purchase.createdAt.getFullYear()}-${String(purchase.createdAt.getMonth() + 1).padStart(2, '0')}`
    spentByMonth.set(purchaseMonth, (spentByMonth.get(purchaseMonth) || 0) + purchase.total)
  }

  const result: MonthData[] = []
  for (let i = 0; i < monthsBack; i++) {
    const month = shiftMonth(referenceMonth, -(monthsBack - 1 - i))
    result.push({
      month,
      spent: spentByMonth.get(month) || 0,
      budget: budgetMap.has(month) ? budgetMap.get(month)! : null,
    })
  }

  return result
}

export async function getTopProducts(
  userId: string,
  month: string,
  limit = 5
): Promise<ProductData[]> {
  const purchases = await getPurchases(userId, month)

  const productMap = new Map<string, { totalSpent: number; count: number; originalName: string }>()

  for (const purchase of purchases) {
    for (const item of purchase.items) {
      const key = item.name.trim().toLowerCase()
      const existing = productMap.get(key)
      if (existing) {
        existing.totalSpent += item.totalPrice