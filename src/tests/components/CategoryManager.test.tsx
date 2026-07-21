import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryManager } from '@/components/CategoryManager'

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 'lacteos', name: 'Lácteos', icon: '🥛', isDefault: true },
      { id: 'custom-1', name: 'Mi categoría', icon: '🎯', isDefault: false },
    ],
    loading: false,
    remove: vi.fn(),
  }),
}))

describe('CategoryManager', () => {
  it('renders all categories', () => {
    render(<CategoryManager userId="test-user" />)
    expect(screen.getByText('Lácteos')).toBeInTheDocument()
    expect(screen.getByText('Mi categoría')).toBeInTheDocument()
  })

  it('shows delete button only for custom categories', () => {
    render(<CategoryManager userId="test-user" />)
    const deleteButtons = screen.getAllByText('×')
    expect(deleteButtons.length).toBe(1)
  })
})
