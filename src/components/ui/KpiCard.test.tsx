import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from './KpiCard'

describe('KpiCard', () => {
  it('renders icon, value, and label', () => {
    render(<KpiCard icon="💰" value="$65.500" label="Gastado" />)
    expect(screen.getByText('💰')).toBeInTheDocument()
    expect(screen.getByText('$65.500')).toBeInTheDocument()
    expect(screen.getByText('Gastado')).toBeInTheDocument()
  })

  it('applies green color by default', () => {
    render(<KpiCard icon="💰" value="$0" label="Test" data-testid="card" />)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('bg-surface')
  })

  it('applies amber color', () => {
    render(<KpiCard icon="💰" value="$0" label="Test" color="amber" data-testid="card" />)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('border-accent-amber/30')
  })

  it('applies red color', () => {
    render(<KpiCard icon="💰" value="$0" label="Test" color="red" data-testid="card" />)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('border-accent-red/30')
  })

  it('applies hover styles', () => {
    render(<KpiCard icon="💰" value="$0" label="Test" data-testid="card" />)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('hover:scale-[1.02]')
    expect(card.className).toContain('hover:shadow-glow')
  })
})
