import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Wallet } from 'lucide-react'
import ExpandableCard from './ExpandableCard'

describe('ExpandableCard', () => {
  it('renders title and icon', () => {
    render(
      <ExpandableCard title="Presupuesto" icon={<Wallet data-testid="icon" />}>
        <p>Content</p>
      </ExpandableCard>
    )
    expect(screen.getByText('Presupuesto')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('collapsed by default — does not show children', () => {
    render(
      <ExpandableCard title="Test" icon={<Wallet />}>
        <p data-testid="content">Hidden content</p>
      </ExpandableCard>
    )
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('expands when header clicked', () => {
    render(
      <ExpandableCard title="Test" icon={<Wallet />}>
        <p data-testid="content">Revealed content</p>
      </ExpandableCard>
    )
    fireEvent.click(screen.getByRole('button', { name: /test/i }))
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByText('Revealed content')).toBeInTheDocument()
  })

  it('collapses when header clicked again', () => {
    render(
      <ExpandableCard title="Test" icon={<Wallet />}>
        <p data-testid="content">Content</p>
      </ExpandableCard>
    )
    const button = screen.getByRole('button', { name: /test/i })
    fireEvent.click(button)
    expect(screen.getByTestId('content')).toBeInTheDocument()
    fireEvent.click(button)
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('starts expanded when defaultExpanded=true', () => {
    render(
      <ExpandableCard title="Test" icon={<Wallet />} defaultExpanded>
        <p data-testid="content">Visible from start</p>
      </ExpandableCard>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('sets aria-expanded attribute', () => {
    render(
      <ExpandableCard title="Test" icon={<Wallet />}>
        <p>Content</p>
      </ExpandableCard>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })
})
