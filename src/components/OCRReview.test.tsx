import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OCRReview from './OCRReview'

vi.mock('@/services/purchases', () => ({
  addPurchase: vi.fn().mockResolvedValue({ id: 'new-id' }),
}))

describe('OCRReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render parsed items', () => {
    render(
      <OCRReview
        items={[
          { name: 'Leche', quantity: 1, unitPrice: 450, totalPrice: 450, confidence: 90 },
          { name: 'Pan', quantity: 2, unitPrice: 100, totalPrice: 200, confidence: 60 },
        ]}
        imageUrl="https://example.com/ticket.jpg"
        userId="user-1"
        onSaved={vi.fn()}
        onRetry={vi.fn()}
      />
    )
    expect(screen.getByText('Leche')).toBeInTheDocument()
    expect(screen.getByText('Pan')).toBeInTheDocument()
  })

  it('should highlight low confidence items in yellow', () => {
    render(
      <OCRReview
        items={[
          { name: 'Leche', quantity: 1, unitPrice: 450, totalPrice: 450, confidence: 90 },
          { name: 'Pan', quantity: 2, unitPrice: 100, totalPrice: 200, confidence: 60 },
        ]}
        imageUrl={null}
        userId="user-1"
        onSaved={vi.fn()}
        onRetry={vi.fn()}
      />
    )
    const lecheRow = screen.getByText('Leche').closest('div')
    const panRow = screen.getByText('Pan').closest('div')
    expect(lecheRow?.className).not.toContain('bg-yellow')
    expect(panRow?.className).toContain('bg-yellow')
  })

  it('should remove item when eliminar clicked', () => {
    render(
      <OCRReview
        items={[
          { name: 'Leche', quantity: 1, unitPrice: 450, totalPrice: 450, confidence: 90 },
        ]}
        imageUrl={null}
        userId="user-1"
        onSaved={vi.fn()}
        onRetry={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(screen.queryByText('Leche')).not.toBeInTheDocument()
  })

  it('should add a manual product via ProductEditor', () => {
    render(
      <OCRReview
        items={[]}
        imageUrl={null}
        userId="user-1"
        onSaved={vi.fn()}
        onRetry={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /agregar producto/i }))
    fireEvent.change(screen.getByLabelText(/producto/i), { target: { value: 'Huevos' } })
    fireEvent.change(screen.getByLabelText(/cant/i), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText(/precio unit/i), { target: { value: '50' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText('Huevos')).toBeInTheDocument()
  })

  it('should call addPurchase and onSaved when guardar compra clicked', async () => {
    const onSaved = vi.fn()
    const { addPurchase } = await import('@/services/purchases')
    render(
      <OCRReview
        items={[
          { name: 'Leche', quantity: 1, unitPrice: 450, totalPrice: 450, confidence: 90 },
        ]}
        imageUrl="https://example.com/ticket.jpg"
        userId="user-1"
        onSaved={onSaved}
        onRetry={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /guardar compra/i }))
    await new Promise((r) => setTimeout(r, 0))
    expect(addPurchase).toHaveBeenCalledWith(
      'user-1',
      [{ name: 'Leche', quantity: 1, unitPrice: 450, totalPrice: 450, confidence: 90 }],
      'https://example.com/ticket.jpg'
    )
    expect(onSaved).toHaveBeenCalled()
  })

  it('should call onRetry when reintentar clicked', () => {
    const onRetry = vi.fn()
    render(
      <OCRReview
        items={[]}
        imageUrl={null}
        userId="user-1"
        onSaved={vi.fn()}
        onRetry={onRetry}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
