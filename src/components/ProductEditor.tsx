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
        <label htmlFor="product-editor-name" className="block text-xs font-medium text-gray-700 mb-1">Producto</label>
        <input
          id="product-editor-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="Ej: Leche"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="product-editor-quantity" className="block text-xs font-medium text-gray-700 mb-1">Cant.</label>
          <input
            id="product-editor-quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label htmlFor="product-editor-unit-price" className="block text-xs font-medium text-gray-700 mb-1">Precio unit.</label>
          <input
            id="product-editor-unit-price"
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
