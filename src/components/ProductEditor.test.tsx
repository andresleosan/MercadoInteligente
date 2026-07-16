import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductEditor from './ProductEditor'

describe('ProductEditor', () => {
  it('should render empty form when no initialItem', () => {
    render(<ProductEditor onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/producto/i)).toHaveValue('')
    expect(screen.getByLabelText(/cant/i).value).toBe('')
    expect(screen.getByLabelText(/precio unit/i).value).toBe('')
  })

  it('should render pre-filled form when initialItem provided', () => {
    render(
      <ProductEditor
        initialItem={{ name: 'Leche', quantity: 2, unitPrice: 450, totalPrice: 900, confidence: 85 }}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/producto/i)).toHaveValue('Leche')
    expect(screen.getByLabelText(/cant/i)).toHaveValue(2)
    expect(screen.getByLabelText(/precio unit/i)).toHaveValue(450)
  })

  it('should calculate totalPrice on save', () => {
    const onSave = vi.fn()
    render(<ProductEditor onSave={onSave} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/producto/i), { target: { value: 'Fideos' } })
    fireEvent.change(screen.getByLabelText(/cant/i), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText(/precio unit/i), { target: { value: '200' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onSave).toHaveBeenCalledWith({
      name: 'Fideos',
      quantity: 3,
      unitPrice: 200,
      totalPrice: 600,
      confidence: undefined,
    })
  })

  it('should not save if name is empty', () => {
    const onSave = vi.fn()
    render(<ProductEditor onSave={onSave} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/cant/i), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText(/precio unit/i), { target: { value: '100' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSave).not.toHaveBeenCalled()
  })

  it('should call onCancel when cancel button clicked', () => {
    const onCancel = vi.fn()
    render(<ProductEditor onSave={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
