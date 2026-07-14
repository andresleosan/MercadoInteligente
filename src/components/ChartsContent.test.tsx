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
