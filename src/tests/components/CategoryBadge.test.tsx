import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryBadge } from '@/components/CategoryBadge'
import type { Category } from '@/types'

describe('CategoryBadge', () => {
  const mockCategory: Category = {
    id: 'lacteos',
    name: 'Lácteos',
    icon: 'milk',
    isDefault: true,
  }

  it('renders category icon and name', () => {
    render(<CategoryBadge category={mockCategory} />)
    expect(screen.getByTestId('category-icon-lacteos')).toBeInTheDocument()
    expect(screen.getByText('Lácteos')).toBeInTheDocument()
  })

  it('applies correct color classes for lacteos', () => {
    render(<CategoryBadge category={mockCategory} />)
    const badge = screen.getByText('Lácteos').parentElement
    expect(badge?.className).toContain('blue')
  })
})
