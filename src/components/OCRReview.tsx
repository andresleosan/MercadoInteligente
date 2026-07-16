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
      setError('Agregá al menos un producto')
      return
    }
    setSaving(true)
    setError('')
    try {
      console.log('[OCRReview:handleSavePurchase] UID SAVE:', userId, '| imageUrl:', imageUrl, '| items count:', items.length)
      await addPurchase(userId, items, imageUrl ?? undefined)
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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Revisá los productos</h2>

        {items.length === 0 && !adding && (
          <p className="text-sm text-gray-600 mb-4">
            No reconocimos productos. Podés cargarlos manualmente o reintentar.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded ${
                item.confidence !== undefined && isLowConfidence(item.confidence) ? 'bg-yellow-50 border border-yellow-200' : ''
              }`}
            >
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">
                {item.quantity}x ${item.unitPrice.toLocaleString()} = ${item.totalPrice.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingIndex(index)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                <button
                  type="button"
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

        {!adding && !isEditing && (
          <button
            type="button"
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

      {!adding && !isEditing && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSavePurchase}
            disabled={saving || items.length === 0}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar compra'}
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
