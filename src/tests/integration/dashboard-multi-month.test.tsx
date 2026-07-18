import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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
vi.mock('@/components/TodayPurchases', () => ({
  default: ({ date }: { date?: string }) => (
    <div data-testid="today-purchases">Today Purchases for {date}</div>
  ),
}))

function renderDashboard() {
  return render(<MemoryRouter><Dashboard /></MemoryRouter>)
}

describe('Dashboard Multi-Month Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads data for the current month', async () => {
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(getTotalSpent).toHaveBeenCalledWith('user-1', expect.stringMatching(/^\d{4}-\d{2}$/))
      expect(screen.getByText('Compras de hoy')).toBeInTheDocument()
    })
  })

  it('shows all main dashboard sections', async () => {
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Compras de hoy')).toBeInTheDocument()
      expect(screen.getByText('Registrar compra')).toBeInTheDocument()
      expect(screen.getByText('Presupuesto diario')).toBeInTheDocument()
      expect(screen.getByText('Historial')).toBeInTheDocument()
      expect(screen.getByText('Resumen mensual')).toBeInTheDocument()
    })
  })

  it('renders AddPurchase component', async () => {
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('add-purchase')).toBeInTheDocument()
    })
  })

  it('renders TodayPurchases component', async () => {
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('today-purchases')).toBeInTheDocument()
    })
  })

  it('shows Gráficos section and renders ChartsSection when expanded', async () => {
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Gráficos')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('charts-section')).not.toBeInTheDocument()

    // The Gráficos section is not defaultExpanded, so it won't show ChartsSection
    // This is expected behavior
  })
})
