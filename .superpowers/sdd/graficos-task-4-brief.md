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
Expected: PASS â€” 7 tests.

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
- Produces: `<ChartsContent userId: string, selectedMonth: string />` â€” default export (necesario para React.lazy).

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
      expect(screen.getByText(/error al cargar grÃ¡ficos/i)).toBeInTheDocument()
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
      console.error('Error cargando grÃ¡ficos:', err)
      setError('Error al cargar grÃ¡ficos. Reintentar.')
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