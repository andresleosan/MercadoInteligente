import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useOCR } from '@/hooks/useOCR'
import { useStores } from '@/hooks/useStores'
import { addPurchase } from '@/services/purchases'
import { suggestCategory } from '@/services/categorizer'
import { saveCategoryMapping } from '@/services/categoryMapping'
import { getCurrentDate } from '@/utils/date'
import type { PurchaseItem, ParsedItem, Store } from '@/types'
import OCRCapture from '@/components/OCRCapture'
import OCRReview from '@/components/OCRReview'
import VoiceCapture from '@/components/VoiceCapture'
import StoreSelector from '@/components/StoreSelector'
import { CategorySelector } from '@/components/CategorySelector'
import { DarkCard } from '@/components/ui/DarkCard'
import { DarkInput } from '@/components/ui/DarkInput'
import { DarkButton } from '@/components/ui/DarkButton'

interface Props {
  onSaved?: () => void
}

export default function AddPurchase({ onSaved }: Props) {
  const { user } = useAuth()
  const stores = useStores(user?.uid ?? null)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [selectedDate, setSelectedDate] = useState(getCurrentDate())
  const [items, setItems] = useState<PurchaseItem[]>([
    { name: '', quantity: 0, unitPrice: 0, totalPrice: 0 }
  ])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'manual' | 'photo' | 'review' | 'error' | 'voice' | 'voice-review'>('manual')
  const [voiceItems, setVoiceItems] = useState<ParsedItem[]>([])
  const [itemCategories, setItemCategories] = useState<Record<number, string>>({})
  const debounceTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const ocr = useOCR(user?.uid ?? null)

  useEffect(() => {
    if (ocr.status === 'done') setMode('review')
    else if (ocr.status === 'error') setMode('error')
  }, [ocr.status])

  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach((t) => clearTimeout(t))
    }
  }, [])

  function handleImageSelected(file: File) {
    ocr.processTicket(file)
  }

  const suggestCategoryForItem = useCallback(
    async (index: number, name: string, userId: string) => {
      if (name.trim().length < 3) return
      try {
        const suggested = await suggestCategory(userId, name)
        setItemCategories((prev) => {
          if (prev[index] === suggested) return prev
          return { ...prev, [index]: suggested ?? '' }
        })
      } catch (err) {
        console.error('Error sugiriendo categoría:', err)
      }
    },
    []
  )

  function updateItem(index: number, field: keyof PurchaseItem, value: string | number) {
    const newItems = [...items]
    const item = newItems[index]!

    if (field === 'name') {
      item.name = value as string
      if (user) {
        const existing = debounceTimersRef.current[index]
        if (existing) clearTimeout(existing)
        debounceTimersRef.current[index] = setTimeout(() => {
          suggestCategoryForItem(index, item.name, user.uid)
        }, 400)
      }
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
    setItemCategories((prev) => {
      const next: Record<number, string> = {}
      Object.entries(prev).forEach(([k, v]) => {
        const i = Number(k)
        if (i < index) next[i] = v
        else if (i > index) next[i - 1] = v
      })
      return next
    })
    if (debounceTimersRef.current[index]) {
      clearTimeout(debounceTimersRef.current[index]!)
      delete debounceTimersRef.current[index]
    }
  }

  function handleCategorySelect(index: number, categoryId: string | null) {
    setItemCategories((prev) => ({ ...prev, [index]: categoryId ?? '' }))
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
      const itemsWithCategory: PurchaseItem[] = validItems.map((item) => {
        const originalIndex = items.indexOf(item)
        const categoryId = itemCategories[originalIndex]
        return { ...item, category: categoryId && categoryId !== '' ? categoryId : undefined }
      })

      console.log('[AddPurchase:handleSubmit] UID SAVE:', user.uid, '| items:', JSON.stringify(itemsWithCategory))
      await addPurchase(
        user.uid,
        itemsWithCategory,
        undefined,
        selectedStore?.id || '',
        selectedStore?.name || 'Sin establecimiento',
        selectedDate
      )

      await Promise.all(
        itemsWithCategory
          .filter((it) => it.name.trim() && it.category)
          .map((it) => saveCategoryMapping(user.uid, it.name, it.category!))
      ).catch((err) => console.error('Error guardando mappings de categoría:', err))

      setItems([{ name: '', quantity: 0, unitPrice: 0, totalPrice: 0 }])
      setItemCategories({})
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
        <div className="mb-6 space-y-4">
          <StoreSelector
            stores={stores.stores}
            selectedStore={selectedStore}
            onSelect={setSelectedStore}
            onCreateInline={stores.create}
            loading={stores.loading}
          />

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Fecha de compra
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-10 px-3 bg-bg-input border border-border-subtle rounded-radius-sm text-sm text-text-primary focus:outline-none focus:border-accent-green transition-colors"
            />
          </div>

          <div className="space-y-2">
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
            storeId={selectedStore?.id}
            storeName={selectedStore?.name}
            purchaseDate={selectedDate}
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
            storeId={selectedStore?.id}
            storeName={selectedStore?.name}
            purchaseDate={selectedDate}
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
            <div key={index} className="bg-bg-surface p-3 rounded-radius-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Item {index + 1}</span>
                <DarkButton
                  variant="danger"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  ×
                </DarkButton>
              </div>
              <DarkInput
                label="Producto"
                type="text"
                required
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder="Ej: Leche"
              />
              {user && (
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Categoría
                  </label>
                  <CategorySelector
                    userId={user.uid}
                    selectedCategoryId={itemCategories[index] || undefined}
                    onSelect={(catId) => handleCategorySelect(index, catId)}
                    compact
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <DarkInput
                  label="Cantidad"
                  type="number"
                  min="1"
                  required
                  value={item.quantity || ''}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  placeholder="1"
                />
                <DarkInput
                  label="Precio unitario"
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={item.unitPrice || ''}
                  onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                  placeholder="Precio"
                />
              </div>
              <div className="text-right">
                <span className="text-sm text-text-secondary">
                  Subtotal: ${(item.quantity * item.unitPrice).toLocaleString()}
                </span>
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
