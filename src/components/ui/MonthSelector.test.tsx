import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MonthSelector } from './MonthSelector'

describe('MonthSelector', () => {
  const baseDate = new Date(2026, 6, 1) // Julio 2026

  it('renders current month and year', () => {
    render(<MonthSelector currentMonth={baseDate} onMonthChange={vi.fn()} />)
    expect(screen.getByText('Julio 2026')).toBeInTheDocument()
  })

  it('calls onMonthChange with previous month when left arrow clicked', () => {
    const onChange = vi.fn()
    render(<MonthSelector currentMonth={baseDate} onMonthChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Mes anterior'))
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 5, 1))
  })

  it('calls onMonthChange with next month when right arrow clicked', () => {
    const onChange = vi.fn()
    render(<MonthSelector currentMonth={baseDate} onMonthChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Mes siguiente'))
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 7, 1))
  })

  it('applies dark theme styles', () => {
    render(<MonthSelector currentMonth={baseDate} onMonthChange={vi.fn()} data-testid="container" />)
    const container = screen.getByTestId('container')
    expect(container.className).toContain('bg-surface')
    expect(container.className).toContain('rounded-radius-lg')
  })
})