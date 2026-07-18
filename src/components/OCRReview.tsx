import { useState } from 'react'
import type { ParsedItem, PurchaseItem } from '@/types'
import { isLowConfidence } from '@/services/ticketParser'
import { addPurchase } from '@/services/purchases'
import ProductEditor from './ProductEditor'
import { DarkButton } from '@/components/ui/DarkButton'

interface Props {
  items: ParsedItem[]
  imageUrl: string | null
  userId: string
  storeId?: string
  storeName?: string
  purchaseDate?: string
  onSaved: () => void
  onRetry: () => void
}

export default function OCRReview({
  items: initialItems,
  imageUrl,
  userId,
  storeId,
  storeName,
  purchaseDate,
  onSaved,
  onRetry,
}: Props) {
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
      setError('Agregá al menos un producto')
      return
    }
    setSaving(true)
    setError('')
    try {
      console.log('[OCRReview:handleSavePurchase] UID SAVE:', userId, '| imageUrl:', imageUrl, '| items count:', items.length)
      await addPurchase(
        userId,
        items,
        imageUrl ?? undefined,
        storeId || '',
        storeName || 'Sin establecimiento',
        purchaseDate
      )
      onSaved()
    } catch (err) {
      console.error('Error al guardar compra desde OCR:', err)
      setError('No se pudo guardar la compra. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const isEditing = editingIndex !== null

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-radius-xl border border-border-subtle shadow-card p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Revisá los productos</h2>

        {items.length === 0 && !adding && (
          <p className="text-sm text-text-secondary mb-4">
            No reconocimos productos. Podés cargarlos manualmente o reintentar.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded-radius-md ${
                item.confidence !== undefined && isLowConfidence(item.confidence)
                  ? 'bg-yellow border border-accent-amber/30'
                  : ''
              }`}
            >
              <p className="text-sm font-medium text-text-primary">{item.name}</p>
              <p className="text-xs text-text-muted">
                {item.quantity}x ${item.unitPrice.toLocaleString()} = ${item.totalPrice.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingIndex(index)}
                  className="text-xs text-accent-green hover:brightness-110 transition-fast"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-xs text-accent-red hover:brightness-110 transition-fast"
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

        {!adding && !isEditing && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-4 text-sm text-accent-green hover:brightness-110 transition-fast"
          >
            + Agregar producto
          </button>
        )}
      </div>

      <div className="bg-surface rounded-radius-xl border border-border-subtle shadow-card p-4">
        <p className="text-lg font-semibold text-text-primary">Total: ${total.toLocaleString()}</p>
        {error && <p className="text-sm text-accent-red mt-1">{error}</p>}
      </div>

      {!adding && !isEditing && (
        <div className="flex gap-2">
          <DarkButton
            variant="primary"
            size="md"
            disabled={saving || items.length === 0}
            onClick={handleSavePurchase}
            className="flex-1"
          >
            {saving ? 'Guardando...' : 'Guardar compra'}
          </DarkButton>
          <DarkButton
            variant="secondary"
            size="md"
            onClick={onRetry}
            className="flex-1"
          >
            Reintentar
          </DarkButton>
        </div>
      )}
    </div>
  )
}
