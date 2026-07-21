import { getPurchasesByDateRange, getPurchases } from '@/services/purchases'
import { getBudgetsByMonthRange } from '@/services/budget'
import type { StoreSpending, DailySpending } from '@/types'

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

export interface StoreChartData {
  name: string
  total: number
  count: number
}

export interface FrequencyData {
  month: string
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

export async function getSpendingByStore(
  userId: string,
  month: string
): Promise<StoreChartData[]> {
  const purchases = await getPurchases(userId, month)
  const byStore = new Map<string, { total: number; count: number; name: string }>()

  for (const purchase of purchases) {
    const key = purchase.storeId || '__no_store__'
    const existing = byStore.get(key) || { total: 0, count: 0, name: purchase.storeName }
    existing.total += purchase.total
    existing.count++
    byStore.set(key, existing)
  }

  return Array.from(byStore.values())
    .map(({ name, total, count }) => ({ name, total, count }))
    .sort((a, b) => b.total - a.total)
}

export async function getPurchaseFrequency(
  userId: string,
  monthsBack: number,
  referenceMonth: string
): Promise<FrequencyData[]> {
  const startMonth = shiftMonth(referenceMonth, -(monthsBack - 1))
  const [startYear, startMonthNum] = startMonth.split('-').map(Number)
  const startDate = new Date(startYear!, startMonthNum! - 1, 1)

  const [refYear, refMonthNum] = referenceMonth.split('-').map(Number)
  const endDate = new Date(refYear!, refMonthNum!, 0, 23, 59, 59)

  const purchases = await getPurchasesByDateRange(userId, startDate, endDate)

  const countByMonth = new Map<string, number>()
  for (const purchase of purchases) {
    const purchaseMonth = `${purchase.createdAt.getFullYear()}-${String(purchase.createdAt.getMonth() + 1).padStart(2, '0')}`
    countByMonth.set(purchaseMonth, (countByMonth.get(purchaseMonth) || 0) + 1)
  }

  const result: FrequencyData[] = []
  for (let i = 0; i < monthsBack; i++) {
    const month = shiftMonth(referenceMonth, -(monthsBack - 1 - i))
    result.push({ month, count: countByMonth.get(month) || 0 })
  }

  return result
}

export async function getDailySpend(
  userId: string,
  daysBack: number
): Promise<DailySpending[]> {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - (daysBack - 1))

  const purchases = await getPurchasesByDateRange(userId, start, end)

  const dailyMap = new Map<string, { total: number; byStore: Map<string, number> }>()

  for (const purchase of purchases) {
    const dateKey: string = purchase.purchaseDate || purchase.createdAt.toISOString().split('T')[0] || ''
    let dayData = dailyMap.get(dateKey)
    if (!dayData) {
      dayData = { total: 0, byStore: new Map() }
      dailyMap.set(dateKey, dayData)
    }
    dayData.total += purchase.total
    const storeKey = purchase.storeId || '__no_store__'
    dayData.byStore.set(storeKey, (dayData.byStore.get(storeKey) || 0) + purchase.total)
  }

  const result: DailySpending[] = []
  for (let i = 0; i < daysBack; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const dayData = dailyMap.get(dateKey)
    result.push({
      date: dateKey,
      total: dayData?.total || 0,
      byStore: dayData?.byStore || new Map(),
    })
  }

  return result.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getStoreRanking(
  userId: string,
  month: string
): Promise<StoreSpending[]> {
  const purchases = await getPurchases(userId, month)

  const storeMap = new Map<string, {
    storeId: string
    storeName: string
    total: number
    purchaseCount: number
    lastPurchase: Date
  }>()

  for (const purchase of purchases) {
    const key = purchase.storeId || '__no_store__'
    const existing = storeMap.get(key)
    if (existing) {
      existing.total += purchase.total
      existing.purchaseCount++
      if (purchase.createdAt > existing.lastPurchase) {
        existing.lastPurchase = purchase.createdAt
      }
    } else {
      storeMap.set(key, {
        storeId: purchase.storeId || '',
        storeName: purchase.storeName || 'Sin establecimiento',
        total: purchase.total,
        purchaseCount: 1,
        lastPurchase: purchase.createdAt,
      })
    }
  }

  return Array.from(storeMap.values())
    .sort((a, b) => b.total - a.total)
}
