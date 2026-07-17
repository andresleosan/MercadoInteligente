import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useOCR } from '@/hooks/useOCR'
import { addPurchase } from '@/services/purchases'
import type { PurchaseItem, ParsedItem } from '@/types'
import OCRCapture from '@/components/OCRCapture'
import OCRReview from '@/components/OCRReview'
import VoiceCapture from '@/components/VoiceCapture'
import { DarkCard } from '@/components/ui/DarkCard'
import { DarkInput } from '@/components/ui/DarkInput'
import { DarkButton } from '@/components/ui/DarkButton'

interface Props {
  onSaved?: () => void
}

export default function AddPurchase({ onSaved }: Props) {
  const { user } = useAuth()
  const [items, setItems] = useState<PurchaseItem[]>([
    { name: '', quantity: 0, unitPrice: 0, totalPrice: 0 }
  ])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'manual' | 'photo' | 'review' | 'error' | 'voice' | 'voice-review'>('manual')
  const [voiceItems, setVoiceItems] = useState<ParsedItem[]>([])
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

  function handleSaved() {
    onSaved?.()
  }

  function addItem() {
    setItems([...items, { name: '', quantity: 0, unitPrice: 0, totalPrice: 0 }])
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
      console.log('[AddPurchase:handleSubmit] UID SAVE:', user.uid, '| items:', JSON.stringify(validItems))
      await addPurchase(user.uid, validItems)
      setItems([{ name: '', quantity: 0, unitPrice: 0, totalPrice: 0 }])
      setMessage('Compra registrada correctamente')
      handleSaved()
    } catch (err) {
      console.error('Error al registrar la compra:', err)
      setMessage('Error al registrar la compra')
    } finally {
      setSaving(false)
    }
  }

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <DarkCard className="p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">
        Registrar compra
      </h2>

      {mode === 'manual' && (
        <div className="mb-6 space-y-2">
          <DarkButton
            variant="secondary"
            onClick={() => setMode('photo')}
            className="w-full"
          >
            📷 Registrar por foto
          </DarkButton>
          <DarkButton
            variant="secondary"
            onClick={() => setMode('voice')}
            className="w-full"
          >
            🎤 Registrar por voz
          </DarkButton>
        </div>
      )}

      {mode === 'photo' && (
        <div className="mb-6">
          <OCRCapture onImageSelected={handleImageSelected} />
          {ocr.status === 'uploading' && <p className="text-sm text-text-muted mt-2">Subiendo imagen...</p>}
          {ocr.status === 'ocr-running' && (
            <p className="text-sm text-text-muted mt-2">Leyendo ticket... (esto puede tardar unos segundos)</p>
          )}
          {ocr.status === 'parsing' && <p className="text-sm text-text-muted mt-2">Procesando productos...</p>}
          <DarkButton
            variant="secondary"
            onClick={() => setMode('manual')}
            className="mt-2"
          >
            ← Volver a carga manual
          </DarkButton>
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
              handleSaved()
            }}
            onRetry={() => {
              ocr.reset()
              setMode('photo')
            }}
          />
        </div>
      )}

      {mode === 'error' && (
        <div className="mb-6 bg-accent-red/10 border border-accent-red/20 rounded-radius-md p-4">
          <p className="text-sm text-accent-red">{ocr.error}</p>
          <div className="flex gap-2 mt-3">
            <DarkButton
              variant="secondary"
              onClick={() => {
                ocr.reset()
                setMode('photo')
              }}
              className="flex-1"
            >
              Reintentar
            </DarkButton>
            <DarkButton
              variant="primary"
              onClick={() => {
                ocr.reset()
                setMode('review')
              }}
              className="flex-1"
            >
              Cargar manualmente
            </DarkButton>
          </div>
        </div>
      )}

      {mode === 'voice' && (
        <div className="mb-6">
          <VoiceCapture
            onDone={(items) => {
              setVoiceItems(items)
              setMode('voice-review')
            }}
            onBack={() => setMode('manual')}
          />
        </div>
      )}

      {mode === 'voice-review' && (
        <div className="mb-6">
          <OCRReview
            items={voiceItems}
            imageUrl={null}
            userId={user!.uid}
            onSaved={() => {
              setVoiceItems([])
              setMode('manual')
              setMessage('Compra registrada correctamente')
              handleSaved()
            }}
            onRetry={() => {
              setVoiceItems([])
              setMode('voice')
            }}
          />
        </div>
      )}

      {mode === 'manual' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <DarkInput
                  label="Producto"
                  type="text"
                  required
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  placeholder="Ej: Leche"
                />
              </div>
              <div className="col-span-2">
                <DarkInput
                  label="Cant."
                  type="number"
                  min="1"
                  required
                  value={item.quantity || ''}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="col-span-3">
                <DarkInput
                  label="Precio unit."
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={item.unitPrice || ''}
                  onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                  placeholder="Precio"
                />
              </div>
              <div className="col-span-2">
                <DarkButton
                  variant="danger"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="w-full"
                >
                  ×
                </DarkButton>
              </div>
            </div>
          ))}

          <DarkButton
            variant="secondary"
            onClick={addItem}
          >
            + Agregar producto
          </DarkButton>

          <div className="pt-4 border-t border-border-subtle">
            <p className="text-lg font-semibold text-text-primary">
              Total: ${total.toLocaleString()}
            </p>
          </div>

          {message && (
            <p className={`text-sm ${message.includes('Error') ? 'text-accent-red' : 'text-accent-green'}`}>
              {message}
            </p>
          )}

          <DarkButton
            type="submit"
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Registrando...' : 'Registrar compra'}
          </DarkButton>
        </form>
      )}
    </DarkCard>
  )
}
