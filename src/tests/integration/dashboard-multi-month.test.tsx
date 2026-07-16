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

  it('navigates to next month and reloads data', async () => {
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
      expect(screen.getAllByText('Presupuesto').length).toBeGreaterThanOrEqual(1)
    })

    fireEvent.click(screen.getByRole('button', { name: /gráficos/i }))

    await waitFor(() => {
      const charts = screen.getByTestId('charts-section')
      expect(charts).toBeInTheDocument()
      expect(charts.getAttribute('data-month')).toMatch(/^\d{4}-\d{2}$/)
    })
  })

  it('passes selectedMonth to PurchaseHistory when expanded', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
    vi.mocked(getTotalSpent).mockResolvedValue(30000)

    renderDashboard()

    await waitFor(() => {
      expect(getBudget).toHaveBeenCalledWith('user-1', expect.any(String))
    })

    fireEvent.click(screen.getByRole('button', { name: /historial de compras/i }))

    await waitFor(() => {
      expect(screen.getByTestId('purchase-history')).toBeInTheDocument()
    })
  })
})
