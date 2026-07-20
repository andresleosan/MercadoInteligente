# Task 5: Dashboard refactor — dark layout with ExpandableCards

**Files:**
- Modify: `src/pages/Dashboard.tsx` — full rewrite
- Modify: `src/pages/Dashboard.test.tsx` — full rewrite
- Modify: `src/tests/integration/dashboard-multi-month.test.tsx` — full rewrite

## Dashboard.tsx

Replace entire file with:

```tsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/services/auth'
import { getBudget } from '@/services/budget'
import { getTotalSpent } from '@/services/purchases'
import { useNavigate } from 'react-router-dom'
import BudgetPage from '@/pages/Budget'
import AddPurchase from '@/pages/AddPurchase'
import PurchaseHistory from '@/pages/PurchaseHistory'
import MonthNavigator from '@/components/MonthNavigator'
import usePWAInstall from '@/hooks/usePWAInstall'
import ChartsSection from '@/components/ChartsSection'
import { getCurrentMonth } from '@/utils/date'
import ExpandableCard from '@/components/ui/ExpandableCard'
import {
  Wallet,
  TrendingUp,
  History,
  PlusCircle,
  BarChart3,
  LogOut,
  Download,
  User,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth)
  const [budget, setBudget] = useState<number | null>(null)
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [budgetVersion, setBudgetVersion] = useState(0)
  const [purchaseVersion, setPurchaseVersion] = useState(0)
  const { isInstallable, promptInstall } = usePWAInstall()

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      if (!user) return
      setLoading(true)
      setError('')

      try {
        const [budgetData, spent] = await Promise.all([
          getBudget(user.uid, selectedMonth),
          getTotalSpent(user.uid, selectedMonth),
        ])

        if (!isMounted) return

        setBudget(budgetData ? budgetData.amount : null)
        setTotalSpent(spent)
      } catch {
        if (isMounted) {
          setError('Error al cargar los datos. Recargá la página.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user, selectedMonth, budgetVersion, purchaseVersion])

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch {
      setError('Error al cerrar sesión.')
    }
  }

  const remaining = budget !== null ? budget - totalSpent : 0
  const isOverBudget = budget !== null && totalSpent > budget
  const percentage = budget !== null && budget > 0 ? (totalSpent / budget) * 100 : 0

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="bg-bg-header border-b border-border-subtle">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wallet className="text-accent-green" size={20} />
            <span className="text-sm font-semibold text-text-primary">Mercado Inteligente</span>
          </div>
          <div className="flex items-center gap-3">
            {isInstallable ? (
              <button
                onClick={() => void promptInstall()}
                className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                <Download size={14} />
                Instalar
              </button>
            ) : null}
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <User size={14} />
              {user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-red transition-colors"
            >
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[640px] mx-auto px-4 py-5 space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-accent-red/10 border border-accent-red/30 rounded-radius-sm px-4 py-3">
            <AlertCircle size={16} className="text-accent-red shrink-0" />
            <p className="text-sm text-accent-red">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-accent-green" size={28} />
          </div>
        ) : (
          <>
            {/* 1. Presupuesto */}
            <ExpandableCard
              title="Presupuesto"
              icon={<Wallet size={18} />}
              defaultExpanded
            >
              <BudgetPage
                month={selectedMonth}
                onSaved={() => setBudgetVersion(v => v + 1)}
              />
            </ExpandableCard>

            {/* 2. Resumen del mes */}
            <ExpandableCard
              title="Resumen del mes"
              icon={<TrendingUp size={18} />}
              defaultExpanded
            >
              <MonthNavigator month={selectedMonth} onChange={setSelectedMonth} />

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-text-secondary">Gastado</p>
                  <p className="text-2xl font-bold text-text-primary">
                    ${totalSpent.toLocaleString()}
                  </p>
                </div>
                {budget !== null ? (
                  <>
                    <div>
                      <p className="text-xs text-text-secondary">Presupuesto</p>
                      <p className="text-2xl font-bold text-text-primary">
                        ${budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">
                        {isOverBudget ? 'Pasado' : 'Restante'}
                      </p>
                      <p className={`text-2xl font-bold ${isOverBudget ? 'text-accent-red' : 'text-accent-green'}`}>
                        ${Math.abs(remaining).toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <p className="text-xs text-text-secondary">Presupuesto</p>
                    <p className="text-sm text-text-muted mt-1">Sin presupuesto</p>
                  </div>
                )}
              </div>

              {budget !== null && budget > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-border-subtle rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage > 100 ? 'bg-accent-red' : percentage > 80 ? 'bg-accent-amber' : 'bg-accent-green'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    {percentage.toFixed(1)}% del presupuesto utilizado
                  </p>
                </div>
              )}
            </ExpandableCard>

            {/* 3. Historial de compras */}
            <ExpandableCard
              title="Historial de compras"
              icon={<History size={18} />}
            >
              <PurchaseHistory month={selectedMonth} version={purchaseVersion} />
            </ExpandableCard>

            {/* 4. Registrar compra */}
            <ExpandableCard
              title="Registrar compra"
              icon={<PlusCircle size={18} />}
            >
              <AddPurchase onSaved={() => setPurchaseVersion(v => v + 1)} />
            </ExpandableCard>

            {/* 5. Gráficos */}
            <ExpandableCard
              title="Gráficos"
              icon={<BarChart3 size={18} />}
            >
              <ChartsSection userId={user!.uid} selectedMonth={selectedMonth} />
            </ExpandableCard>
          </>
        )}
      </main>
    </div>
  )
}
```

## Dashboard.test.tsx

Replace entire file with:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'

vi.mock('@/hooks/useAuth', () => {
  const user = { uid: 'user-1', email: 'test@test.com' }
  return { useAuth: () => ({ user }) }
})
vi.mock('@/hooks/usePWAInstall', () => ({
  default: () => ({ isInstallable: false, promptInstall: vi.fn() }),
}))
vi.mock('@/services/auth', () => ({
  logout: vi.fn(),
}))
vi.mock('@/services/budget', () => ({
  getBudget: vi.fn(),
}))
vi.mock('@/services/purchases', () => ({
  getTotalSpent: vi.fn(),
  getPurchases: vi.fn(),
}))
vi.mock('@/pages/Budget', () => ({
  default: ({ onSaved }: { onSaved?: () => void }) => (
    <div data-testid="budget-form">
      Budget Form
      {onSaved && (
        <button data-testid="budget-save-button" onClick={onSaved}>
          Guardar
        </button>
      )}
    </div>
  ),
}))
vi.mock('@/pages/AddPurchase', () => ({
  default: () => <div data-testid="add-purchase">Add Purchase</div>,
}))
vi.mock('@/pages/PurchaseHistory', () => ({
  default: ({ month }: { month?: string }) => (
    <div data-testid="purchase-history">History for {month}</div>
  ),
}))
vi.mock('@/components/ChartsSection', () => ({
  default: ({ userId, selectedMonth }: { userId: string; selectedMonth: string }) => (
    <div data-testid="charts-section" data-userid={userId} data-month={selectedMonth}>
      Charts Section
    </div>
  ),
}))

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show current month label on load', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    const now = new Date()
    const monthName = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][now.getMonth()]
    await waitFor(() => {
      expect(screen.getByText(`${monthName} ${now.getFullYear()}`)).toBeInTheDocument()
    })
  })

  it('should show resumen with presupuesto and restante when budget exists', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Gastado')).toBeInTheDocument()
      expect(screen.getByText('Presupuesto')).toBeInTheDocument()
      expect(screen.getByText('Restante')).toBeInTheDocument()
      expect(screen.getByText('$20.000')).toBeInTheDocument()
    })
  })

  it('should show Pasado in red when spent > budget', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(80000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Pasado')).toBeInTheDocument()
      expect(screen.getByText('$30.000')).toBeInTheDocument()
    })
  })

  it('should show Sin presupuesto when budget is null', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue(null)
    vi.mocked(getTotalSpent).mockResolvedValue(0)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Sin presupuesto')).toBeInTheDocument()
    })
  })

  it('should render budget form inline (no showBudgetForm toggle)', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue(null)
    vi.mocked(getTotalSpent).mockResolvedValue(0)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('budget-form')).toBeInTheDocument()
      expect(screen.getByText('Resumen del mes')).toBeInTheDocument()
    })
  })

  it('should call services with selectedMonth when navigating', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(getBudget).toHaveBeenCalledWith('user-1', expect.any(String))
    })

    vi.mocked(getBudget).mockClear()
    vi.mocked(getTotalSpent).mockClear()

    fireEvent.click(screen.getByRole('button', { name: /mes anterior/i }))

    await waitFor(() => {
      expect(getBudget).toHaveBeenCalledWith('user-1', expect.any(String))
      expect(getTotalSpent).toHaveBeenCalledWith('user-1', expect.any(String))
    })
  })

  it('should pass month to PurchaseHistory', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('purchase-history')).toBeInTheDocument()
    })
  })

  it('should reload budget and show it in summary after saving via Budget form', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(10000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Sin presupuesto')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('budget-save-button'))

    await waitFor(() => {
      expect(screen.queryByText('Sin presupuesto')).not.toBeInTheDocument()
      expect(screen.getByText('Restante')).toBeInTheDocument()
      expect(screen.getByText('$40.000')).toBeInTheDocument()
    })

    expect(getBudget).toHaveBeenCalledTimes(2)
  })

  it('should render ChartsSection when Graficos card is expanded', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Presupuesto')).toBeInTheDocument()
    })

    // ChartsSection is inside ExpandableCard (collapsed by default)
    expect(screen.queryByTestId('charts-section')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /gráficos/i }))

    await waitFor(() => {
      const charts = screen.getByTestId('charts-section')
      expect(charts).toBeInTheDocument()
      expect(charts.getAttribute('data-userid')).toBe('user-1')
      expect(charts.getAttribute('data-month')).toMatch(/^\d{4}-\d{2}$/)
    })
  })
})
```

## dashboard-multi-month.test.tsx

Replace entire file with:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user-1', email: 'test@test.com' } }),
}))
vi.mock('@/hooks/usePWAInstall', () => ({
  default: () => ({ isInstallable: false, promptInstall: vi.fn() }),
}))
vi.mock('@/services/auth', () => ({
  logout: vi.fn(),
}))
vi.mock('@/services/budget', () => ({
  getBudget: vi.fn(),
}))
vi.mock('@/services/purchases', () => ({
  getTotalSpent: vi.fn(),
  getPurchases: vi.fn(),
}))
vi.mock('@/pages/Budget', () => ({
  default: ({ onSaved }: { onSaved?: () => void }) => (
    <div data-testid="budget-form">
      Budget Form
      {onSaved && <button data-testid="budget-save-button" onClick={onSaved}>Guardar</button>}
    </div>
  ),
}))
vi.mock('@/pages/AddPurchase', () => ({
  default: () => <div data-testid="add-purchase">Add Purchase</div>,
}))
vi.mock('@/pages/PurchaseHistory', () => ({
  default: ({ month }: { month?: string }) => (
    <div data-testid="purchase-history">History for {month}</div>
  ),
}))
vi.mock('@/components/ChartsSection', () => ({
  default: ({ userId, selectedMonth }: { userId: string; selectedMonth: string }) => (
    <div data-testid="charts-section" data-userid={userId} data-month={selectedMonth}>Charts Section</div>
  ),
}))

function renderDashboard() {
  return render(<MemoryRouter><Dashboard /></MemoryRouter>)
}

describe('Dashboard Multi-Month Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads budget and spent data for the selected month', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(getBudget).toHaveBeenCalledWith('user-1', expect.stringMatching(/^\d{4}-\d{2}$/))
      expect(getTotalSpent).toHaveBeenCalledWith('user-1', expect.stringMatching(/^\d{4}-\d{2}$/))
      expect(screen.getByText('Gastado')).toBeInTheDocument()
      expect(screen.getByText('$30.000')).toBeInTheDocument()
    })
  })

  it('navigates to previous month and reloads data', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Gastado')).toBeInTheDocument()
    })

    vi.mocked(getBudget).mockClear()
    vi.mocked(getTotalSpent).mockClear()

    vi.mocked(getBudget).mockResolvedValue({ amount: 30000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(15000)

    fireEvent.click(screen.getByRole('button', { name: /mes anterior/i }))

    await waitFor(() => {
      expect(getBudget).toHaveBeenCalledWith('user-1', expect.any(String))
      expect(getTotalSpent).toHaveBeenCalledWith('user-1', expect.any(String))
    })
  })

  it('navigates to next month and reloads data', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Gastado')).toBeInTheDocument()
    })

    vi.mocked(getBudget).mockClear()
    vi.mocked(getTotalSpent).mockClear()

    vi.mocked(getBudget).mockResolvedValue({ amount: 70000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(60000)

    fireEvent.click(screen.getByRole('button', { name: /mes siguiente/i }))

    await waitFor(() => {
      expect(getBudget).toHaveBeenCalledWith('user-1', expect.any(String))
      expect(getTotalSpent).toHaveBeenCalledWith('user-1', expect.any(String))
    })
  })

  it('shows different budget data when navigating between months', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')

    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('$30.000')).toBeInTheDocument()
      expect(screen.getByText('$20.000')).toBeInTheDocument()
    })

    vi.mocked(getBudget).mockResolvedValue({ amount: 80000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(20000)

    fireEvent.click(screen.getByRole('button', { name: /mes siguiente/i }))

    await waitFor(() => {
      expect(screen.getByText('$20.000')).toBeInTheDocument()
      expect(screen.getByText('$60.000')).toBeInTheDocument()
    })
  })

  it('passes selectedMonth to ChartsSection when expanded', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Presupuesto')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /gráficos/i }))

    await waitFor(() => {
      const charts = screen.getByTestId('charts-section')
      expect(charts).toBeInTheDocument()
      expect(charts.getAttribute('data-month')).toMatch(/^\d{4}-\d{2}$/)
    })
  })

  it('passes selectedMonth to PurchaseHistory', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('purchase-history')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /mes anterior/i }))

    await waitFor(() => {
      expect(screen.getByText(/History for/)).toBeInTheDocument()
    })
  })
})
```

## Steps

- [ ] Write all 3 files with the exact content above
- [ ] Run the dashboard tests: `npx vitest run src/pages/Dashboard.test.tsx src/tests/integration/dashboard-multi-month.test.tsx`
- [ ] Run full build: `npx vite build 2>&1`
- [ ] Commit

```bash
git add src/pages/Dashboard.tsx src/pages/Dashboard.test.tsx src/tests/integration/dashboard-multi-month.test.tsx
git commit -m "feat: Dashboard refactor completo con ExpandableCards, header premium, jerarquia v2"
```
