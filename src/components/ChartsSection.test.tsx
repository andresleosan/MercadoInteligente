import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/services/analytics', () => ({
  getTotalSpentByMonth: vi.fn().mockResolvedValue([]),
  getTopProducts: vi.fn().mockResolvedValue([]),
}))

vi.mock('./ChartsContent', () => ({
  default: ({ userId, selectedMonth }: { userId: string; selectedMonth: string }) => (
    <div data-testid="charts-content" data-userid={userId} data-month={selectedMonth}>
      Charts Content Mock
    </div>
  ),
}))

import ChartsSection from './ChartsSection'

describe('ChartsSection', () => {
  it('renders ChartsContent with userId and selectedMonth', async () => {
    render(<ChartsSection userId="u1" selectedMonth="2026-07" />)
    const content = await screen.findByTestId('charts-content')
    expect(content).toBeInTheDocument()
    expect(content.getAttribute('data-userid')).toBe('u1')
    expect(content.getAttribute('data-month')).toBe('2026-07')
  })
})
