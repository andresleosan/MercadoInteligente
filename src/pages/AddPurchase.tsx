import { useState, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { addPurchase } from '@/services/purchases'
import type { PurchaseItem } from '@/types'

export default function AddPurchase() {
  const { user } = useAuth()
  const [items, setItems] = useState<PurchaseItem[]>([
    { name: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function updateItem(index: number, field: keyof PurchaseItem, value: string | number) {
    const newItems = [...items]
    const item = newItems[index]!
    
    if (field === 'name') {
      item.name = value as string
    } else if (field === 'quantity') {
      item.quantity = Number(value)
    } else if (field === 'unitPrice') {
      item.unitPrice = Number(value)
    }
    
    item.totalPrice = item.quantity * item.unitPrice
    setItems(newItems)
  }

  function addItem() {
    setItems([...items, { name: '', quantity: 1, unitPrice: 0, totalPrice: 0 }])
  }

  function removeItem(index: number) {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return

    const validItems = items.filter(item => item.name.trim() && item.quantity > 0 && item.unitPrice > 0)
    if (validItems.length === 0) {
      setMessage('Agregá al menos un producto válido')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      await addPurchase(user.uid, validItems)
      setItems([{ name: '', quantity: 1, unitPrice: 0, totalPrice: 0 }])
      setMessage('Compra registrada correctamente')
    } catch (err) {
      setMessage('Error al registrar la compra')
    } finally {
      setSaving(false)
    }
  }

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Registrar compra
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Producto
              </label>
              <input
                type="text"
                required
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: Leche"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cant.
              </label>
              <input
                type="number"
                min="1"
                required
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Precio unit.
              </label>
              <input
                type="number"
                min="0"
                step="10"
                required
                value={item.unitPrice}
                onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="0"
              />
            </div>
            <div className="col-span-2">
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="w-full py-1.5 px-2 border border-gray-300 rounded-md text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:text-gray-400"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="text-sm text-green-600 hover:text-green-800"
        >
          + Agregar producto
        </button>

        <div className="pt-4 border-t">
          <p className="text-lg font-semibold text-gray-900">
            Total: ${total.toLocaleString()}
          </p>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {saving ? 'Registrando...' : 'Registrar compra'}
        </button>
      </form>
    </div>
  )
}
