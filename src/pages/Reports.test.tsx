import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import Reports from './Reports'
import { useAuth } from '@/hooks/useAuth'
import {
  getMonthlyComparison,
  getCategorySpending,
  getMonthlyTrends,
} from '@/services/reports'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/services/reports', () => ({
  getMonthlyComparison: vi.fn(),
  getCategorySpending: vi.fn(),
  getMonthlyTrends: vi.fn(),
  formatMonthLabel: vi.fn((m) => `Mes ${m}`),
  shiftMonth: vi.fn((m, d) => `${m}-shifted-${d}`),
}))

vi.mock('@/services/export', () => ({
  exportReportToPDF: vi.fn(),
}))

import { exportReportToPDF } from '@/services/export'

// Mock recharts ResponsiveContainer to avoid size/DOM issues in JSDOM
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  }
})

describe('Reports Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'user-123', email: 'test@example.com' } as any,
      loading: false,
    })
  })

  it('renders loading state initially', () => {
    vi.mocked(getMonthlyComparison).mockReturnValue(new Promise(() => {}))
    vi.mocked(getCategorySpending).mockReturnValue(new Promise(() => {}))
    vi.mocked(getMonthlyTrends).mockReturnValue(new Promise(() => {}))

    render(
      <BrowserRouter>
        <Reports />
      </BrowserRouter>
    )

    expect(screen.getByText('Generando reportes del mes...')).toBeInTheDocument()
  })

  it('renders KPIs, category chart and breakdown table when data loads', async () => {
    vi.mocked(getMonthlyComparison).mockResolvedValue({
      currentMonth: '2026-07',
      currentSpent: 150000,
      currentBudget: 200000,
      previousMonth: '2026-06',
      previousSpent: 120000,
      difference: 30000,
      percentageChange: 25,
      topCategory: {
        categoryId: 'carnes',
        categoryName: 'Carnes',
        icon: 'beef',
        color: '#EF4444',
        total: 80000,
        percentage: 53.3,
        itemCount: 4,
      },
      purchaseCount: 3,
      averageTicket: 50000,
      savingsOrDeficit: 50000,
    })

    vi.mocked(getCategorySpending).mockResolvedValue([
      {
        categoryId: 'carnes',
        categoryName: 'Carnes',
        icon: 'beef',
        color: '#EF4444',
        total: 80000,
        percentage: 53.3,
        itemCount: 4,
      },
      {
        categoryId: 'lacteos',
        categoryName: 'Lácteos',
        icon: 'milk',
        color: '#38BDF8',
        total: 70000,
        percentage: 46.7,
        itemCount: 5,
      },
    ])

    vi.mocked(getMonthlyTrends).mockResolvedValue([
      { month: '2026-06', monthLabel: 'Junio 2026', spent: 120000, budget: 200000 },
      { month: '2026-07', monthLabel: 'Julio 2026', spent: 150000, budget: 200000 },
    ])

    render(
      <BrowserRouter>
        <Reports />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Reportes y Tendencias')).toBeInTheDocument()
    })

    // Check KPIs
    expect(screen.getByText('$150,000')).toBeInTheDocument()
    expect(screen.getByText('+25%')).toBeInTheDocument()
    expect(screen.getByText('$50,000')).toBeInTheDocument() // average ticket
    expect(screen.getAllByText('Carnes').length).toBeGreaterThan(0)

    // Check table rows
    expect(screen.getAllByText('Lácteos').length).toBeGreaterThan(0)
    expect(screen.getAllByText('$70,000').length).toBeGreaterThan(0)
    expect(screen.getByText('5 uds')).toBeInTheDocument()
  })

  it('renders empty state when month has no purchases', async () => {
    vi.mocked(getMonthlyComparison).mockResolvedValue({
      currentMonth: '2026-07',
      currentSpent: 0,
      currentBudget: 200000,
      previousMonth: '2026-06',
      previousSpent: 0,
      difference: 0,
      percentageChange: 0,
      topCategory: null,
      purchaseCount: 0,
      averageTicket: 0,
      savingsOrDeficit: 200000,
    })
    vi.mocked(getCategorySpending).mockResolvedValue([])
    vi.mocked(getMonthlyTrends).mockResolvedValue([])

    render(
      <BrowserRouter>
        <Reports />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/No hay compras registradas/i)).toBeInTheDocument()
    })

    expect(screen.getByText('Registrar una compra')).toBeInTheDocument()
  })

  it('allows changing months with chevron buttons', async () => {
    vi.mocked(getMonthlyComparison).mockResolvedValue({
      currentMonth: '2026-07',
      currentSpent: 0,
      currentBudget: null,
      previousMonth: '2026-06',
      previousSpent: 0,
      difference: 0,
      percentageChange: 0,
      topCategory: null,
      purchaseCount: 0,
      averageTicket: 0,
      savingsOrDeficit: null,
    })
    vi.mocked(getCategorySpending).mockResolvedValue([])
    vi.mocked(getMonthlyTrends).mockResolvedValue([])

    render(
      <BrowserRouter>
        <Reports />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Mes anterior')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Mes anterior'))
    expect(getMonthlyComparison).toHaveBeenCalled()
  })

  it('displays error message and allows retry', async () => {
    vi.mocked(getMonthlyComparison).mockRejectedValueOnce(new Error('Network error'))

    render(
      <BrowserRouter>
        <Reports />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No se pudieron cargar los datos de reportes. Intenta de nuevo.')).toBeInTheDocument()
    })

    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('triggers exportReportToPDF when clicking export PDF button', async () => {
    const mockComparison = {
      currentMonth: '2026-07',
      currentSpent: 150000,
      currentBudget: 200000,
      previousMonth: '2026-06',
      previousSpent: 120000,
      difference: 30000,
      percentageChange: 25,
      topCategory: null,
      purchaseCount: 3,
      averageTicket: 50000,
      savingsOrDeficit: 50000,
    }
    const mockCategories = [
      {
        categoryId: 'carnes',
        categoryName: 'Carnes',
        icon: 'beef',
        color: '#EF4444',
        total: 80000,
        percentage: 53.3,
        itemCount: 4,
      },
    ]

    vi.mocked(getMonthlyComparison).mockResolvedValue(mockComparison)
    vi.mocked(getCategorySpending).mockResolvedValue(mockCategories)
    vi.mocked(getMonthlyTrends).mockResolvedValue([])

    render(
      <BrowserRouter>
        <Reports />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Exportar reporte a PDF')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Exportar reporte a PDF'))

    expect(exportReportToPDF).toHaveBeenCalledWith({
      month: expect.any(String),
      comparison: mockComparison,
      categories: mockCategories,
    })
  })
})
