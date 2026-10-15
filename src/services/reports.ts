import { getPurchases } from '@/services/purchases'
import { getBudgetsByMonthRange } from '@/services/budget'
import { getCategories } from '@/services/categories'
import { getTotalSpentByMonth } from '@/services/analytics'
import type { Category } from '@/types'

export interface CategorySpending {
  categoryId: string
  categoryName: string
  icon: string
  color: string
  total: number
  percentage: number
  itemCount: number
}

export interface MonthlyComparison {
  currentMonth: string
  currentSpent: number
  currentBudget: number | null
  previousMonth: string
  previousSpent: number
  difference: number
  percentageChange: number
  topCategory: CategorySpending | null
  purchaseCount: number
  averageTicket: number
  savingsOrDeficit: number | null
}

export interface MonthlyTrend {
  month: string
  monthLabel: string
  spent: number
  budget: number | null
}

export const CATEGORY_COLORS: Record<string, string> = {
  lacteos: '#38BDF8', // light blue
  panaderia: '#F59E0B', // amber
  carnes: '#EF4444', // red
  'frutas-verduras': '#10B981', // green
  bebidas: '#6366F1', // indigo
  limpieza: '#14B8A6', // teal
  higiene: '#EC4899', // pink
  snacks: '#F97316', // orange
  otro: '#8B5CF6', // purple
}

export const FALLBACK_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#6366F1', '#F97316', '#A855F7',
]

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-').map(Number)
  if (!year || !monthNum) return month
  return `${MONTH_NAMES[monthNum - 1]} ${year}`
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthNum] = month.split('-').map(Number)
  const date = new Date(year!, monthNum! - 1, 1)
  date.setMonth(date.getMonth() + delta)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/**
 * Agrupa y calcula el gasto por categoría en un mes dado.
 */
export async function getCategorySpending(
  userId: string,
  month: string
): Promise<CategorySpending[]> {
  const [purchases, categories] = await Promise.all([
    getPurchases(userId, month),
    getCategories(userId).catch(() => [] as Category[]),
  ])

  const categoryMap = new Map<string, { name: string; icon: string }>()
  for (const cat of categories) {
    categoryMap.set(cat.id, { name: cat.name, icon: cat.icon })
  }

  const spendingMap = new Map<string, { total: number; itemCount: number }>()
  let totalItemsSpent = 0

  for (const purchase of purchases) {
    for (const item of purchase.items || []) {
      const catId = item.category || 'otro'
      const price = item.totalPrice || 0
      totalItemsSpent += price

      const existing = spendingMap.get(catId) || { total: 0, itemCount: 0 }
      existing.total += price
      existing.itemCount += item.quantity || 1
      spendingMap.set(catId, existing)
    }
  }

  const results: CategorySpending[] = []
  let colorIndex = 0

  for (const [catId, data] of spendingMap.entries()) {
    const meta = categoryMap.get(catId)
    const name = meta?.name || (catId === 'otro' ? 'Otro' : catId)
    const icon = meta?.icon || 'tag'
    const color = CATEGORY_COLORS[catId] || FALLBACK_COLORS[colorIndex % FALLBACK_COLORS.length]!
    colorIndex++

    const percentage = totalItemsSpent > 0 ? (data.total / totalItemsSpent) * 100 : 0

    results.push({
      categoryId: catId,
      categoryName: name,
      icon,
      color,
      total: Math.round(data.total * 100) / 100,
      percentage: Math.round(percentage * 10) / 10,
      itemCount: data.itemCount,
    })
  }

  return results.sort((a, b) => b.total - a.total)
}

/**
 * Obtiene el resumen y comparativa del mes actual frente al anterior.
 */
export async function getMonthlyComparison(
  userId: string,
  currentMonth: string
): Promise<MonthlyComparison> {
  const previousMonth = shiftMonth(currentMonth, -1)

  const [currentPurchases, prevPurchases, budgetMap, categorySpending] = await Promise.all([
    getPurchases(userId, currentMonth),
    getPurchases(userId, previousMonth),
    getBudgetsByMonthRange(userId, 1, currentMonth).catch(() => new Map<string, number>()),
    getCategorySpending(userId, currentMonth),
  ])

  const currentSpent = currentPurchases.reduce((sum, p) => sum + (p.total || 0), 0)
  const previousSpent = prevPurchases.reduce((sum, p) => sum + (p.total || 0), 0)
  const currentBudget = budgetMap.get(currentMonth) ?? null

  const difference = currentSpent - previousSpent
  let percentageChange = 0
  if (previousSpent > 0) {
    percentageChange = Math.round(((currentSpent - previousSpent) / previousSpent) * 100)
  } else if (currentSpent > 0) {
    percentageChange = 100
  }

  const purchaseCount = currentPurchases.length
  const averageTicket = purchaseCount > 0 ? Math.round(currentSpent / purchaseCount) : 0
  const savingsOrDeficit = currentBudget !== null ? currentBudget - currentSpent : null
  const topCategory = categorySpending.length > 0 ? categorySpending[0]! : null

  return {
    currentMonth,
    currentSpent,
    currentBudget,
    previousMonth,
    previousSpent,
    difference,
    percentageChange,
    topCategory,
    purchaseCount,
    averageTicket,
    savingsOrDeficit,
  }
}

/**
 * Obtiene la tendencia de los últimos N meses formateada para gráficos.
 */
export async function getMonthlyTrends(
  userId: string,
  monthsBack: number = 6,
  referenceMonth: string
): Promise<MonthlyTrend[]> {
  const monthData = await getTotalSpentByMonth(userId, monthsBack, referenceMonth)

  return monthData.map((d) => ({
    month: d.month,
    monthLabel: formatMonthLabel(d.month),
    spent: d.spent,
    budget: d.budget,
  }))
}

