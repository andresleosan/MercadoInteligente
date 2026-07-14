## Task 6: `ProductEditor.tsx` â€” form de un producto

**Files:**
- Create: `src/components/ProductEditor.tsx`
- Test: `src/components/ProductEditor.test.tsx`

**Interfaces:**
- Consumes: `ParsedItem` y `PurchaseItem` de `@/types`.
- Produces: componente `<ProductEditor initialItem?: ParsedItem | PurchaseItem; onSave: (item: PurchaseItem) => void; onCancel: () => void />`.

- [ ] **Step 1: Write the failing test**

Crear `src/components/ProductEditor.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductEditor from './ProductEditor'

describe('ProductEditor', () => {
  it('should render empty form when no initialItem', () => {
    render(<ProductEditor onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/producto/i)).toHaveValue('')
    expect(screen.getByLabelText(/cant/i)).toHaveValue(1)
    expect(screen.getByLabelText(/precio unit/i)).toHaveValue(0)
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ProductEditor.test.tsx`
Expected: FAIL con `Cannot find module './ProductEditor'`.

- [ ] **Step 3: Write minimal implementation**

Crear `src/components/ProductEditor.tsx`:

```tsx
import { useState, type FormEvent } from 'react'
import type { ParsedItem, PurchaseItem } from '@/types'

interface Props {
  initialItem?: ParsedItem | PurchaseItem
  onSave: (item: PurchaseItem) => void
  onCancel: () => void
}

export default function ProductEditor({ initialItem, onSave, onCancel }: Props) {
  const [name, setName] = useState(initialItem?.name ?? '')
  const [quantity, setQuantity] = useState(initialItem?.quantity ?? 1)
  const [unitPrice, setUnitPrice] = useState(initialItem?.unitPrice ?? 0)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || quantity <= 0 || unitPrice <= 0) return
    onSave({
      name: name.trim(),
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
      confidence: initialItem?.confidence,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Producto</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="Ej: Leche"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Cant.</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Precio unit.</label>
          <input
            type="number"
            min="0"
            step="10"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-1.5 px-3 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-1.5 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ProductEditor.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProductEditor.tsx src/components/ProductEditor.test.tsx
git commit -m "feat(ocr): componente ProductEditor reutilizable (creacion y edicion)"
```
