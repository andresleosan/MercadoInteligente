## Task 8: `OCRReview.tsx` â€” pantalla de revisiÃ³n editable

**Files:**
- Create: `src/components/OCRReview.tsx`
- Test: `src/components/OCRReview.test.tsx`

**Interfaces:**
- Consumes: `useOCR` hook, `ProductEditor`, `ParsedItem`/`PurchaseItem` de `@/types`, `isLowConfidence` de `@/services/ticketParser`, `addPurchase` de `@/services/purchases`.
- Produces: `<OCRReview items={ParsedItem[]} imageUrl={string|null} userId={string} onSaved={() => void} onRetry={() => void} />`.

- [ ] **Step 1: Write the failing test**

Crear `src/components/OCRReview.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/OCRReview.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Crear `src/components/OCRReview.tsx`:

```tsx
import { useState } from 'react'
import type { ParsedItem, PurchaseItem } from '@/types'
import { isLowConfidence } from '@/services/ticketParser'
import { addPurchase } from '@/services/purchases'
import ProductEditor from './ProductEditor'

interface Props {
  items: ParsedItem[]
  imageUrl: string | null
  userId: string
  onSaved: () => void
  onRetry: () => void
}

export default function OCRReview({ items: initialItems, imageUrl, userId, onSaved, onRetry }: Props) {
  const [items, setItems] = useState<PurchaseItem[]>(initialItems)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function saveEdit(updated: PurchaseItem) {
    if (editingIndex === null) return
    const newItems = [...items]
    newItems[editingIndex] = updated
    setItems(newItems)
    setEditingIndex(null)
  }

  function addManual(newItem: PurchaseItem) {
    setItems([...items, newItem])
    setAdding(false)
  }

  async function handleSavePurchase() {
    if (items.length === 0) {
      setError('AgregÃ¡ al menos un producto')
      return
    }
    setSaving(true)
    setError('')
    try {
      await addPurchase(userId, items, imageUrl ?? undefined)
      onSaved()
    } catch (e) {
      setError('No se pudo guardar la compra. IntentÃ¡ de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">RevisÃ¡ los productos</h2>

        {items.length === 0 && !adding && (
          <p className="text-sm text-gray-600 mb-4">
            No reconocimos productos. PodÃ©s cargarlos manualmente o reintentar.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-2 rounded ${
                item.confidence !== undefined && isLowConfidence(item.confidence) ? 'bg-yellow-50 border border-yellow-200' : ''
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity}x ${item.unitPrice.toLocaleString()} = ${item.totalPrice.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingIndex(index)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => removeItem(index)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {editingIndex !== null && (
          <div className="mt-4">
            <ProductEditor
              initialItem={items[editingIndex]}
              onSave={saveEdit}
              onCancel={() => setEditingIndex(null)}
            />
          </div>
        )}

        {adding && (
          <div className="mt-4">
            <ProductEditor onSave={addManual} onCancel={() => setAdding(false)} />
          </div>
        )}

        {!adding && editingIndex === null && (
          <button
            onClick={() => setAdding(true)}
            className="mt-4 text-sm text-green-600 hover:text-green-800"
          >
            + Agregar producto
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-lg font-semibold text-gray-900">Total: ${total.toLocaleString()}</p>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSavePurchase}
          disabled={saving || items.length === 0}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar compra'}
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/OCRReview.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/OCRReview.tsx src/components/OCRReview.test.tsx
git commit -m "feat(ocr): componente OCRReview - revision editable con resaltado de confianza"
```
