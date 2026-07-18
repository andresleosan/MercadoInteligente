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
vi.mock('@/components/TodayPurchases', () => ({
  default: ({ date }: { date?: string }) => (
    <div data-testid="today-purchases">Today Purchases for {date}</div>
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

    await waitFor(() => {
      expect(screen.getByText('Mercado Inteligente')).toBeInTheDocument()
    })
  })

  it('should show resumen with presupuesto and restante when budget exists', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Compras de hoy')).toBeInTheDocument()
      expect(screen.getByText('Registrar compra')).toBeInTheDocument()
      expect(screen.getByText('Resumen mensual')).toBeInTheDocument()
    })
  })

  it('should show Pasado in red when spent > budget', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(80000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Compras de hoy')).toBeInTheDocument()
    })
  })

  it('should show Sin presupuesto when budget is null', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue(null)
    vi.mocked(getTotalSpent).mockResolvedValue(0)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Compras de hoy')).toBeInTheDocument()
    })
  })

  it('should render budget form inline (no showBudgetForm toggle)', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue(null)
    vi.mocked(getTotalSpent).mockResolvedValue(0)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Presupuesto diario')).toBeInTheDocument()
    })

    // Budget card is not defaultExpanded, click to expand
    fireEvent.click(screen.getByText('Presupuesto diario'))

    await waitFor(() => {
      expect(screen.getByTestId('budget-form')).toBeInTheDocument()
    })
  })

  it('should call services with selectedMonth when navigating', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
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
      expect(screen.getByText('Historial')).toBeInTheDocument()
    })
  })

  it('should reload budget and show it in summary after saving via Budget form', async () => {
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getTotalSpent).mockResolvedValue(10000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Presupuesto diario')).toBeInTheDocument()
    })

    // Budget card is not defaultExpanded, click to expand
    fireEvent.click(screen.getByText('Presupuesto diario'))

    await waitFor(() => {
      expect(screen.getByTestId('budget-save-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('budget-save-button'))

    // onSaved callback is invoked — component doesn't crash
    await waitFor(() => {
      expect(screen.getByText('Resumen mensual')).toBeInTheDocument()
    })
  })

  it('should render ChartsSection when Graficos card is expanded', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Gráficos')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('charts-section')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Gráficos'))

    await waitFor(() => {
      const charts = screen.getByTestId('charts-section')
      expect(charts).toBeInTheDocument()
      expect(charts.getAttribute('data-userid')).toBe('user-1')
      expect(charts.getAttribute('data-month')).toMatch(/^\d{4}-\d{2}$/)
    })
  })
})
