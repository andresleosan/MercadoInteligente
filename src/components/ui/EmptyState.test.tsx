import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders icon, title, and description', () => {
    render(<EmptyState icon="🛒" title="No items" description="Add something" />)
    expect(screen.getByText('🛒')).toBeInTheDocument()
    expect(screen.getByText('No items')).toBeInTheDocument()
    expect(screen.getByText('Add something')).toBeInTheDocument()
  })

  it('renders CTA button when action is provided', () => {
    const onClick = vi.fn()
    render(
      <EmptyState
        icon="🛒"
        title="No items"
        description="Add something"
        action={{ label: 'Add item', onClick }}
      />
    )
    const btn = screen.getByText('Add item')
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not render CTA button when action is not provided', () => {
    render(<EmptyState icon="🛒" title="No items" description="Add something" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})