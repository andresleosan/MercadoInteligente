# Fase 3: Dashboard con Gráficos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar 3 gráficos (barras gastado vs presupuesto, top 5 productos, línea de tendencia) al Dashboard, colapsables por default con lazy-load de Recharts.

**Architecture:** `ChartsSection` (colapsable) + `ChartsContent` (lazy, Recharts). Servicios `analytics.ts` con `getTotalSpentByMonth` (1 query, agregación cliente) y `getTopProducts` (agrupación por nombre). `getBudgetsByMonthRange` en budget.ts. `getPurchasesByDateRange` en purchases.ts.

**Tech Stack:** React 18 + TypeScript + Vite, Firebase Firestore, Recharts (lazy-load), Vitest + @testing-library/react.

## Global Constraints

- Nomenclatura: PascalCase componentes, camelCase funciones/variables.
- Estilos: Tailwind CSS, mobile-first. Verde (`green-600`) primario, `red-600` para sobre-presupuesto, `gray-600` para línea de presupuesto.
- Path alias: `@/` → `./src/`.
- Firebase: usar instancias desde `@/config/firebase`. Servicios existentes no se rompen.
- Formato de mes: `YYYY-MM`.
- Tests: Vitest + vi.mock para Firebase y Recharts. Excluir `.test.tsx` del typecheck de build.
- Build: `npm run build` = `tsc -b && vite build`.
- Commits: prefijos `feat:`, `fix:`, `test:`, `docs:`. Español.
- `noUnusedLocals` y `noUnusedParameters` habilitados.
- Recharts se importa dinámicamente en `ChartsContent` (lazy-load), no en el bundle inicial.

---

## File Structure

| Archivo | Responsabilidad | Acción |
|---|---|---|
| `src/services/purchases.ts` | Agregar `getPurchasesByDateRange(userId, startDate, endDate)`. | Modificar |
| `src/services/budget.ts` | Agregar `getBudgetsByMonthRange(userId, monthsBack, referenceMonth)`. | Modificar |
| `src/services/analytics.ts` | `getTotalSpentByMonth` + `getTopProducts` + tipos `MonthData`/`ProductData`. | Crear |
| `src/services/analytics.test.ts` | Tests de analytics con mocks. | Crear |
| `src/components/ChartsSection.tsx` | Colapsable + React.lazy + Suspense. | Crear |
| `src/components/ChartsContent.tsx` | 3 gráficos Recharts + carga de datos + estados. | Crear |
| `src/components/ChartsContent.test.tsx` | Tests con Recharts mockeado. | Crear |
| `src/components/ChartsSection.test.tsx` | Tests del colapsable. | Crear |
| `src/pages/Dashboard.tsx` | Agregar `<ChartsSection>` debajo del resumen. | Modificar |
| `package.json` | Agregar `recharts` dependency. | Modificar |

---

## Task 1: `getPurchasesByDateRange` en `purchases.ts`

**Files:**
- Modify: `src/services/purchases.ts`

**Interfaces:**
- Produces: `getPurchasesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Purchase[]>`. Una query con `where('createdAt', '>=', startDate)` + `where('createdAt', '<=', endDate)` + `orderBy('createdAt', 'desc')`.

- [ ] **Step 1: Add the function at the end of `src/services/purchases.ts`**

Agregar después de `getTotalSpent` (línea 93):

```ts
export async function getPurchasesByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Purchase[]> {
  if (!db || !isConfigValid) return []

  const purchasesRef = collection(db, 'users', userId, 'purchases')
  const q = query(
    purchasesRef,
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId,
      items: data.items,
      total: data.total,
      receiptImageUrl: data.receiptImageUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  })
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/services/purchases.ts
git commit -m "feat(graficos): getPurchasesByDateRange para query de 6 meses"
```

---

## Task 2: `getBudgetsByMonthRange` en `budget.ts`

**Files:**
- Modify: `src/services/budget.ts`

**Interfaces:**
- Produces: `getBudgetsByMonthRange(userId: string, monthsBack: number, referenceMonth: string): Promise<Map<string, number>>`. Retorna un Map de `month → amount` para los meses que tienen presupuesto.

- [ ] **Step 1: Add the function at the end of `src/services/budget.ts`**

Agregar después de `getAllBudgets`:

```ts
export async function getBudgetsByMonthRange(
  userId: string,
  monthsBack: number,
  referenceMonth: string
): Promise<Map<string, number>> {
  const budgets = new Map<string, number>()
  const [refYear, refMonthNum] = referenceMonth.split('-').map(Number)
  if (!refYear || !refMonthNum) return budgets

  const promises: Promise<void>[] = []
  for (let i = 0; i < monthsBack; i++) {
    const date = new Date(refYear, refMonthNum - 1 - i, 1)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    promises.push(
      getBudget(userId, month).then((budget) => {
        if (budget) {
          budgets.set(month, budget.amount)
        }
      })
    )
  }

  await Promise.all(promises)
  return budgets
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/services/budget.ts
git commit -m "feat(graficos): getBudgetsByMonthRange para cargar presupuestos de 6 meses"
```

---

## Task 3: `analytics.ts` — servicios de agregación

**Files:**
- Create: `src/services/analytics.ts`
- Test: `src/services/analytics.test.ts`

**Interfaces:**
- Consumes: `getPurchasesByDateRange` de `@/services/purchases`, `getBudgetsByMonthRange` de `@/services/budget`, `getPurchases` de `@/services/purchases`.
- Produces:
  - `MonthData = { month: string, spent: number, budget: number | null }`
  - `ProductData = { name: string, totalSpent: number, count: number }`
  - `getTotalSpentByMonth(userId, monthsBack, referenceMonth): Promise<MonthData[]>`
  - `getTopProducts(userId, month, limit=5): Promise<ProductData[]>`

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/services/analytics.test.ts`
Expected: PASS — 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/analytics.ts src/services/analytics.test.ts
git commit -m "feat(graficos): servicios analytics getTotalSpentByMonth y getTopProducts"
```

---

## Task 4: Instalar Recharts + `ChartsContent.tsx`

**Files:**
- Create: `src/components/ChartsContent.tsx`
- Test: `src/components/ChartsContent.test.tsx`
- Modify: `package.json` (npm install recharts)

**Interfaces:**
- Consumes: `getTotalSpentByMonth`, `getTopProducts` de `@/services/analytics`.
- Produces: `<ChartsContent userId: string, selectedMonth: string />` — default export (necesario para React.lazy).

- [ ] **Step 1: Install Recharts**

Run: `npm install recharts`

- [ ] **Step 2: Write the failing test**

Crear `src/components/ChartsContent.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

vi.mock('recharts', () => ({
  ComposedChart: () => <div data-testid="composed-chart" />,
  BarChart: () => <div data-testid="bar-chart" />,
  LineChart: () => <div data-testid="line-chart" />,
  Bar: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}))
vi.mock('@/services/analytics', () => ({
  getTotalSpentByMonth: vi.fn(),
  getTopProducts: vi.fn(),
}))

import ChartsContent from './ChartsContent'

describe('ChartsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render 3 charts when data loads', async () => {
    const { getTotalSpentByMonth } = await import('@/services/analytics')
    const { getTopProducts } = await import('@/services/analytics')

    vi.mocked(getTotalSpentByMonth).mockResolvedValue([
      { month: '2026-02', spent: 30000, budget: 50000 },
      { month: '2026-03', spent: 40000, budget: 50000 },
    ])
    vi.mocked(getTopProducts).mockResolvedValue([
      { name: 'Leche', totalSpent: 4500, count: 3 },
    ])

    render(<ChartsContent userId="u1" selectedMonth="2026-07" />)

    await waitFor(() => {
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  it('should show error message when analytics fail', async () => {
    const { getTotalSpentByMonth } = await import('@/services/analytics')
    vi.mocked(getTotalSpentByMonth).mockRejectedValue(new Error('Firestore fail'))

    render(<ChartsContent userId="u1" selectedMonth="2026-07" />)

    await waitFor(() => {
      expect(screen.getByText(/error al cargar gráficos/i)).toBeInTheDocument()
    })
  })

  it('should show empty state for top products when no purchases', async () => {
    const { getTotalSpentByMonth } = await import('@/services/analytics')
    const { getTopProducts } = await import('@/services/analytics')

    vi.mocked(getTotalSpentByMonth).mockResolvedValue([
      { month: '2026-07', spent: 0, budget: null },
    ])
    vi.mocked(getTopProducts).mockResolvedValue([])

    render(<ChartsContent userId="u1" selectedMonth="2026-07" />)

    await waitFor(() => {
      expect(screen.getByText(/sin compras en este mes/i)).toBeInTheDocument()
    })
  })

  it('should show retry button on error', async () => {
    const { getTotalSpentByMonth } = await import('@/services/analytics')
    vi.mocked(getTotalSpentByMonth).mockRejectedValue(new Error('fail'))

    render(<ChartsContent userId="u1" selectedMonth="2026-07" />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/components/ChartsContent.test.tsx`
Expected: FAIL.

- [ ] **Step 4: Write minimal implementation**

Crear `src/components/ChartsContent.tsx`:

```tsx
import { useState, useEffect } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, BarChart, LineChart,
} from 'recharts'
import { getTotalSpentByMonth, getTopProducts } from '@/services/analytics'
import type { MonthData, ProductData } from '@/services/analytics'

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function monthToLabel(month: string): string {
  const [, monthNum] = month.split('-').map(Number)
  return MONTH_LABELS[(monthNum || 1) - 1]
}

interface Props {
  userId: string
  selectedMonth: string
}

export default function ChartsContent({ userId, selectedMonth }: Props) {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([])
  const [topProducts, setTopProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [monthly, top] = await Promise.all([
        getTotalSpentByMonth(userId, selectedMonth, 6),
        getTopProducts(userId, selectedMonth, 5),
      ])
      setMonthlyData(monthly)
      setTopProducts(top)
    } catch (err) {
      console.error('Error cargando gráficos:', err)
      setError('Error al cargar gráficos. Reintentar.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    async function fetch() {
      setLoading(true)
      setError('')
      try {
        const [monthly, top] = await Promise.all([
          getTotalSpentByMonth(userId, selectedMonth, 6),
          getTopProducts(userId, selectedMonth, 5),
        ])
        if (!isMounted) return
        setMonthlyData(monthly)
        setTopProducts(top)
      } catch (err) {
        console.error('Error cargando gráficos:', err)
        if (isMounted) setError('Error al cargar gráficos. Reintentar.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetch()
    return () => { isMounted = false }
  }, [userId, selectedMonth])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button onClick={loadData} className="text-sm text-green-600 hover:text-green-800">
          Reintentar
        </button>
      </div>
    )
  }

  const chartData = monthlyData.map((d) => ({
    name: monthToLabel(d.month),
    spent: d.spent,
    budget: d.budget,
  }))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastado vs Presupuesto (6 meses)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="spent" fill="#16a34a" name="Gastado" />
            <Line dataKey="budget" stroke="#6b7280" name="Presupuesto" connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 productos</h3>
        {topProducts.length === 0 ? (
          <p className="text-gray-600">Sin compras en este mes.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="totalSpent" fill="#16a34a" name="Gastado" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de gastos</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line dataKey="spent" stroke="#16a34a" name="Gastado" dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ChartsContent.test.tsx`
Expected: PASS — 4 tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/ChartsContent.tsx src/components/ChartsContent.test.tsx package.json package-lock.json
git commit -m "feat(graficos): ChartsContent con 3 graficos Recharts (lazy-load)"
```

---

## Task 5: `ChartsSection.tsx` — colapsable + React.lazy

**Files:**
- Create: `src/components/ChartsSection.tsx`
- Test: `src/components/ChartsSection.test.tsx`

**Interfaces:**
- Produces: `<ChartsSection userId: string, selectedMonth: string />`. Botón "Ver gráficos" / "Ocultar gráficos". Lazy-load de ChartsContent.

- [ ] **Step 1: Write the failing test**

Crear `src/components/ChartsSection.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/services/analytics', () => ({
  getTotalSpentByMonth: vi.fn().mockResolvedValue([]),
  getTopProducts: vi.fn().mockResolvedValue([]),
}))

import ChartsSection from './ChartsSection'

describe('ChartsSection', () => {
  it('should render collapsed by default with Ver gráficos button', () => {
    render(<ChartsSection userId="u1" selectedMonth="2026-07" />)
    expect(screen.getByRole('button', { name: /ver gráficos/i })).toBeInTheDocument()
  })

  it('should expand when Ver gráficos clicked', async () => {
    render(<ChartsSection userId="u1" selectedMonth="2026-07" />)
    fireEvent.click(screen.getByRole('button', { name: /ver gráficos/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ocultar gráficos/i })).toBeInTheDocument()
    })
  })

  it('should collapse when Ocultar gráficos clicked', async () => {
    render(<ChartsSection userId="u1" selectedMonth="2026-07" />)
    fireEvent.click(screen.getByRole('button', { name: /ver gráficos/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ocultar gráficos/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /ocultar gráficos/i }))
    expect(screen.getByRole('button', { name: /ver gráficos/i })).toBeInTheDocument()
  })

  it('should show spinner fallback while loading ChartsContent', async () => {
    render(<ChartsSection userId="u1" selectedMonth="2026-07" />)
    fireEvent.click(screen.getByRole('button', { name: /ver gráficos/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ocultar gráficos/i })).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ChartsSection.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Crear `src/components/ChartsSection.tsx`:

```tsx
import { useState, lazy, Suspense } from 'react'

const ChartsContent = lazy(() => import('./ChartsContent'))

interface Props {
  userId: string
  selectedMonth: string
}

export default function ChartsSection({ userId, selectedMonth }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-white rounded-lg shadow p-4 text-left flex justify-between items-center hover:bg-gray-50"
      >
        <span className="text-lg font-semibold text-gray-900">
          📊 {expanded ? 'Ocultar gráficos' : 'Ver gráficos'}
        </span>
        <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-4">
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            }
          >
            <ChartsContent userId={userId} selectedMonth={selectedMonth} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ChartsSection.test.tsx`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/ChartsSection.tsx src/components/ChartsSection.test.tsx
git commit -m "feat(graficos): ChartsSection colapsable con lazy-load de Recharts"
```

---

## Task 6: Integrar `ChartsSection` en `Dashboard.tsx`

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Add import and component to Dashboard**

En `src/pages/Dashboard.tsx`:

1. Agregar import después de la línea 11 (`import usePWAInstall`):
```ts
import ChartsSection from '@/components/ChartsSection'
```

2. Agregar `<ChartsSection>` dentro del `<>` fragment (después del bloque de resumen `</div>` que cierra a línea 179, y antes del grid `div className="grid grid-cols-1 lg:grid-cols-2 gap-6"`):

```tsx
            <ChartsSection userId={user!.uid} selectedMonth={selectedMonth} />
```

El resultado: entre el resumen del mes y el grid de Budget/AddPurchase, va la sección de gráficos colapsable.

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS. Verificar que Recharts esté en un chunk separado (no en el bundle principal).

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat(graficos): integrar ChartsSection en Dashboard (colapsable, debajo del resumen)"
```

---

## Task 7: Tests de integración + smoke test + build + deploy

**Files:**
- Modify: `src/pages/Dashboard.test.tsx` (extender con test de ChartsSection)

- [ ] **Step 1: Add integration test to Dashboard.test.tsx**

Agregar a `src/pages/Dashboard.test.tsx` (dentro del `describe('Dashboard multi-mes', ...)`):

```tsx
vi.mock('@/components/ChartsSection', () => ({
  default: ({ userId, selectedMonth }: { userId: string; selectedMonth: string }) => (
    <div data-testid="charts-section" data-userid={userId} data-month={selectedMonth}>
      Charts Section
    </div>
  ),
}))
```

Agregar test:

```tsx
it('should render ChartsSection with userId and selectedMonth', async () => {
  const { getBudget } = await import('@/services/budget')
  const { getTotalSpent } = await import('@/services/purchases')
  vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
  vi.mocked(getTotalSpent).mockResolvedValue(30000)

  renderDashboard()

  await waitFor(() => {
    const charts = screen.getByTestId('charts-section')
    expect(charts).toBeInTheDocument()
    expect(charts.getAttribute('data-userid')).toBe('user-1')
    expect(charts.getAttribute('data-month')).toMatch(/^\d{4}-\d{2}$/)
  })
})
```

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: PASS — todos los tests.

- [ ] **Step 3: Build de producción**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Actualizar tasks-v2.md**

Marcar las tareas 3.1-3.6 de la Fase 3 como `aprobada`:

```md
### Fase 3 — Dashboard con Gráficos
| # | Tarea | Titán | Estado |
|---|---|---|---|
| 3.1 | Instalar Recharts | Atlas | aprobada |
| 3.2 | Crear gráfico de gastos por mes (barras) | Hefesto | aprobada |
| 3.3 | Crear gráfico de gastos por categoría (pie chart) | Hefesto | aprobada |
| 3.4 | Crear gráfico de tendencia de gastos (línea) | Hefesto | aprobada |
| 3.5 | Integrar gráficos en Dashboard | Hefesto | aprobada |
| 3.6 | Tests de gráficos | Temis | aprobada |
```

Nota: 3.3 "pie chart" se reemplazó por "top 5 productos" (aprobado en brainstorming — sin categorías en v2).

- [ ] **Step 5: Commit y push**

```bash
git add src/pages/Dashboard.test.tsx tasks-v2.md
git commit -m "docs: Fase 3 Dashboard con Graficos aprobada"
git push origin master
```

---

## Self-Review Checklist

- **Spec coverage:**
  - Barras gastado vs presupuesto 6 meses: Task 3 (getTotalSpentByMonth) + Task 4 (ComposedChart) ✓
  - Top 5 productos mes seleccionado: Task 3 (getTopProducts) + Task 4 (BarChart horizontal) ✓
  - Línea tendencia 6 meses: Task 4 (LineChart) ✓
  - Colapsable + lazy-load: Task 5 (ChartsSection con React.lazy + Suspense) ✓
  - 6 meses hasta mes seleccionado: Task 3 (referenceMonth param) ✓
  - Una sola query 6 meses: Task 1 (getPurchasesByDateRange) ✓
  - Barras con línea presupuesto: Task 4 (ComposedChart Bar + Line) ✓
  - Top 5 mes seleccionado: Task 3 (getTopProducts uid, month) ✓
  - Error handling independiente: Task 4 (error state + reintentar) ✓
  - Mes sin compras: Task 4 ("Sin compras en este mes") ✓
  - Menos de 6 meses historial: Task 3 (result.length = monthsBack, meses vacíos spent=0) ✓

- **Placeholders:** Ninguno. Todos los pasos tienen código completo.

- **Type consistency:**
  - `MonthData` definido en Task 3, usado en Task 4 ✓
  - `ProductData` definido en Task 3, usado en Task 4 ✓
  - `getPurchasesByDateRange(userId, startDate, endDate)` definido en Task 1, usado en Task 3 ✓
  - `getBudgetsByMonthRange(userId, monthsBack, referenceMonth)` definido en Task 2, usado en Task 3 ✓
  - `ChartsContent` default export (necesario para React.lazy) ✓
  - `ChartsSection` props `userId, selectedMonth` ✓
