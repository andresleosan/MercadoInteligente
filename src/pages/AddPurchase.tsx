import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useOCR } from '@/hooks/useOCR'
import { addPurchase } from '@/services/purchases'
import type { PurchaseItem } from '@/types'
import OCRCapture from '@/components/OCRCapture'
import OCRReview from '@/components/OCRReview'

export default function AddPurchase() {
  const { user } = useAuth()
  const [items, setItems] = useState<PurchaseItem[]>([
    { name: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'manual' | 'photo' | 'review' | 'error'>('manual')
  const ocr = useOCR(user?.uid ?? null)

  useEffect(() => {
    if (ocr.status === 'done') setMode('review')
    else if (ocr.status === 'error') setMode('error')
  }, [ocr.status])

  function handleImageSelected(file: File) {
    ocr.processTicket(file)
  }

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

      {mode === 'manual' && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setMode('photo')}
            className="w-full py-2 px-4 border border-green-600 rounded-md text-sm font-medium text-green-700 hover:bg-green-50"
          >
            📷 Registrar por foto
          </button>
        </div>
      )}

      {mode === 'photo' && (
        <div className="mb-6">
          <OCRCapture onImageSelected={handleImageSelected} />
          {ocr.status === 'uploading' && <p className="text-sm text-gray-600 mt-2">Subiendo imagen...</p>}
          {ocr.status === 'ocr-running' && (
            <p className="text-sm text-gray-600 mt-2">Leyendo ticket... (esto puede tardar unos segundos)</p>
          )}
          {ocr.status === 'parsing' && <p className="text-sm text-gray-600 mt-2">Procesando productos...</p>}
          <button
            type="button"
            onClick={() => setMode('manual')}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Volver a carga manual
          </button>
        </div>
      )}

      {mode === 'review' && (
        <div className="mb-6">
          <OCRReview
            items={ocr.items}
            imageUrl={ocr.imageUrl}
            userId={user!.uid}
            onSaved={() => {
              ocr.reset()
              setMode('manual')
              setMessage('Compra registrada correctamente')
            }}
            onRetry={() => {
              ocr.reset()
              setMode('photo')
            }}
          />
        </div>
      )}

      {mode === 'error' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{ocr.error}</p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                ocr.reset()
                setMode('photo')
              }}
              className="flex-1 py-1.5 px-3 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => {
                ocr.reset()
                setMode('review')
              }}
              className="flex-1 py-1.5 px-3 border border-transparent rounded-md text-sm text-white bg-green-600 hover:bg-green-700"
            >
              Cargar manualmente
            </button>
          </div>
        </div>
      )}

      {mode === 'manual' && (
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
      )}
    </div>
  )
}
