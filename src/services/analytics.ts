import { getPurchasesByDateRange, getPurchases } from '@/services/purchases'
import { getBudgetsByMonthRange } from '@/services/budget'

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
        existing.count += 1
      } else {
        productMap.set(key, {
          totalSpent: item.totalPrice,
          count: 1,
          originalName: item.name.trim(),
        })
      }
    }
  }

  return Array.from(productMap.entries())
    .map(([, data]) => ({
      name: data.originalName,
      totalSpent: data.totalSpent,
      count: data.count,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit)
}
