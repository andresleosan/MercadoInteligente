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

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )
}

describe('Dashboard multi-mes', () => {
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

  it('should show Sin presupuesto and Definir button when budget is null', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue(null)
    vi.mocked(getTotalSpent).mockResolvedValue(0)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Sin presupuesto')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /definir presupuesto/i })).toBeInTheDocument()
    })
  })

  it('should open Budget form when Definir presupuesto clicked', async () => {
    const { getBudget } = await import('@/services/budget')
    const { getTotalSpent } = await import('@/services/purchases')
    vi.mocked(getBudget).mockResolvedValue(null)
    vi.mocked(getTotalSpent).mockResolvedValue(0)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /definir presupuesto/i })).toBeInTheDocument()
    })

    expect(screen.getByText('Resumen del mes')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /definir presupuesto/i }))

    await waitFor(() => {
      expect(screen.getByTestId('budget-form')).toBeInTheDocument()
      expect(screen.queryByText('Resumen del mes')).not.toBeInTheDocument()
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

    fireEvent.click(screen.getByRole('button', { name: /definir presupuesto/i }))

    await waitFor(() => {
      expect(screen.getByTestId('budget-form')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('budget-save-button'))

    await waitFor(() => {
      expect(screen.queryByText('Sin presupuesto')).not.toBeInTheDocument()
      expect(screen.getByText('Restante')).toBeInTheDocument()
      expect(screen.getByText('$40.000')).toBeInTheDocument()
    })

    expect(getBudget).toHaveBeenCalledTimes(2)
  })
})
