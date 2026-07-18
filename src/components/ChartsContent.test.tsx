import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

vi.mock('recharts', () => ({
  ComposedChart: () => <div data-testid="composed-chart" />,
  BarChart: () => <div data-testid="bar-chart" />,
  LineChart: () => <div data-testid="line-chart" />,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => null,
  Cell: () => null,
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
  getSpendingByStore: vi.fn(),
  getPurchaseFrequency: vi.fn(),
}))

import ChartsContent from './ChartsContent'

describe('ChartsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render 3 charts when data loads', async () => {
    const { getTotalSpentByMonth, getTopProducts, getSpendingByStore, getPurchaseFrequency } = await import('@/services/analytics')

    vi.mocked(getTotalSpentByMonth).mockResolvedValue([
      { month: '2026-02', spent: 30000, budget: 50000 },
      { month: '2026-03', spent: 40000, budget: 50000 },
    ])
    vi.mocked(getTopProducts).mockResolvedValue([
      { name: 'Leche', totalSpent: 4500, count: 3 },
    ])
    vi.mocked(getSpendingByStore).mockResolvedValue([
      { name: 'Ara', total: 15000, count: 5 },
    ])
    vi.mocked(getPurchaseFrequency).mockResolvedValue([
      { month: '2026-02', count: 3 },
      { month: '2026-03', count: 4 },
    ])

    render(<ChartsContent userId="u1" selectedMonth="2026-07" />)

    await waitFor(() => {
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
      expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })
  })

  it('should show error message when analytics fail', async () => {
    const { getTotalSpentByMonth, getSpendingByStore, getPurchaseFrequency } = await import('@/services/analytics')
    vi.mocked(getTotalSpentByMonth).mockRejectedValue(new Error('Firestore fail'))
    vi.mocked(getSpendingByStore).mockRejectedValue(new Error('Firestore fail'))
    vi.mocked(getPurchaseFrequency).mockRejectedValue(new Error('Firestore fail'))

    render(<ChartsContent userId="u1" selectedMonth="2026-07" />)

    await waitFor(() => {
      expect(screen.getByText(/error al cargar gráficos/i)).toBeInTheDocument()
    })
  })

  it('should show empty state for top products when no purchases', async () => {
    const { getTotalSpentByMonth, getTopProducts, getSpendingByStore, getPurchaseFrequency } = await import('@/services/analytics')

    vi.mocked(getTotalSpentByMonth).mockResolvedValue([
      { month: '2026-07', spent: 0, budget: null },
    ])
    vi.mocked(getTopProducts).mockResolvedValue([])
    vi.mocked(getSpendingByStore).mockResolvedValue([])
    vi.mocked(getPurchaseFrequency).mockResolvedValue([])

    render(<ChartsContent userId="u1" selectedMonth="2026-07" />)

    await waitFor(() => {
      expect(screen.getByText(/sin compras en este mes/i)).toBeInTheDocument()
    })
  })

  it('should show retry button on error', async () => {
    const { getTotalSpentByMonth, getSpendingByStore, getPurchaseFrequency } = await import('@/services/analytics')
    vi.mocked(getTotalSpentByMonth).mockRejectedValue(new Error('fail'))
    vi.mocked(getSpendingByStore).mockRejectedValue(new Error('fail'))
    vi.mocked(getPurchaseFrequency).mockRejectedValue(new Error('fail'))

    render(<ChartsContent userId="u1" selectedMonth="2026-07" />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
    })
  })
})
