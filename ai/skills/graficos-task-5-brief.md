        if (isMounted) setError('Error al cargar grÃ¡ficos. Reintentar.')
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
Expected: PASS â€” 4 tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/ChartsContent.tsx src/components/ChartsContent.test.tsx package.json package-lock.json
git commit -m "feat(graficos): ChartsContent con 3 graficos Recharts (lazy-load)"
```

---

## Task 5: `ChartsSection.tsx` â€” colapsable + React.lazy

**Files:**
- Create: `src/components/ChartsSection.tsx`
- Test: `src/components/ChartsSection.test.tsx`

**Interfaces:**
- Produces: `<ChartsSection userId: string, selectedMonth: string />`. BotÃ³n "Ver grÃ¡ficos" / "Ocultar grÃ¡ficos". Lazy-load de ChartsContent.

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
  it('should render collapsed by default with Ver grÃ¡ficos button', () => {
    render(<ChartsSection userId="u1" selectedMonth="2026-07" />)
    expect(screen.getByRole('button', { name: /ver grÃ¡ficos/i })).toBeInTheDocument()
  })

  it('should expand when Ver grÃ¡ficos clicked', async () => {