import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DarkCard } from './DarkCard'

describe('DarkCard', () => {
  it('renders children', () => {
    render(<DarkCard><span>Content</span></DarkCard>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies primary variant styles by default', () => {
    render(<DarkCard data-testid="card">Content</DarkCard>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('bg-surface')
    expect(card.className).toContain('rounded-radius-xl')
  })

  it('applies secondary variant styles', () => {
    render(<DarkCard variant="secondary" data-testid="card">Content</DarkCard>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('bg-elevated')
    expect(card.className).toContain('rounded-radius-lg')
  })

  it('applies hover styles when hover=true', () => {
    render(<DarkCard hover data-testid="card">Content</DarkCard>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('hover:shadow-elevated')
    expect(card.className).toContain('hover:scale-[1.01]')
  })

  it('applies custom className', () => {
    render(<DarkCard className="custom-class" data-testid="card">Content</DarkCard>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('custom-class')
  })
})
