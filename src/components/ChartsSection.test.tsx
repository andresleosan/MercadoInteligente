import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/services/analytics', () => ({
  getTotalSpentByMonth: vi.fn().mockResolvedValue([]),
  getTopProducts: vi.fn().mockResolvedValue([]),
}))

import ChartsSection from './ChartsSection'

describe('ChartsSection', () => {
  it('should render collapsed by default with Ver gráficos button', () => {
    render(<ChartsSection userId="u1" selectedMonth="2026-07" />)
    expect(screen.getByRole('button', { name: /ver gráficos/i })).toBeInTheDocument()
  })

  it('should expand when Ver gráficos clicked', async () => {
    render(<ChartsSection userId="u1" selectedMonth="2026-07" />)
    fireEvent.click(screen.getByRole('button', { name: /ver gráficos/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ocultar gráficos/i })).toBeInTheDocument()
    })
  })

  it('should collapse when Ocultar gráficos clicked', async () => {
    render(<ChartsSection userId="u1" selectedMonth="2026-07" />)
    fireEvent.click(screen.getByRole('button', { name: /ver gráficos/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ocultar gráficos/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /ocultar gráficos/i }))
    expect(screen.getByRole('button', { name: /ver gráficos/i })).toBeInTheDocument()
  })

  it('should show spinner fallback while loading ChartsContent', async () => {
    render(<ChartsSection userId="u1" selectedMonth="2026-07" />)
    fireEvent.click(screen.getByRole('button', { name: /ver gráficos/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ocultar gráficos/i })).toBeInTheDocument()
    })
  })
})
