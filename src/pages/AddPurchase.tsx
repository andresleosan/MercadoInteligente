import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useOCR } from '@/hooks/useOCR'
import { useStores } from '@/hooks/useStores'
import { addPurchase } from '@/services/purchases'
import { getCurrentDate } from '@/utils/date'
import type { PurchaseItem, Store } from '@/types'
import OCRCapture from '@/components/OCRCapture'
import OCRReview from '@/components/OCRReview'
import VoiceCapture from '@/components/VoiceCapture'
import StoreSelector from '@/components/StoreSelector'
import { DarkCard } from '@/components/ui/DarkCard'
import { DarkInput } from '@/components/ui/DarkInput'
import { DarkButton } from '@/components/ui/DarkButton'

interface Props {
  onSaved?: () => void
}

export default function AddPurchase({ onSaved }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const stores = useStores(user?.uid ?? null)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [pendingStoreName, setPendingStoreName] = useState('')
  const [selectedDate, setSelectedDate] = useState(getCurrentDate())
  const [items, setItems] = useState<PurchaseItem[]>([
    { name: '', quantity: 0, unitPrice: 0, totalPrice: 0 }
  ])
  const [discountPercent, setDiscountPercent] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'manual' | 'photo' | 'review' | 'error' | 'voice' | 'voice-review'>('manual')
  const [voiceItems, setVoiceItems] = useState<PurchaseItem[]>([])
  const debounceTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const ocr = useOCR(user?.uid ?? null)
  const lastStoreKey = user ? `mercado-inteligente:last-store:${user.uid}` : null

  useEffect(() => {
    if (!lastStoreKey || stores.loading || selectedStore) return

    const storedStoreId = localStorage.getItem(lastStoreKey)
    if (!storedStoreId) return

    const storedStore = stores.stores.find((store) => store.id === storedStoreId) || null
    if (storedStore) {
      setSelectedStore(storedStore)
    }
  }, [lastStoreKey, selectedStore, stores.loading, stores.stores])

  useEffect(() => {
    if (!selectedStore || stores.loading) return

    const stillExists = stores.stores.some((store) => store.id === selectedStore.id)
    if (!stillExists) {
      setSelectedStore(null)
      setPendingStoreName('')
    }
  }, [selectedStore, stores.loading, stores.stores])

  useEffect(() => {
    if (!lastStoreKey) return

    if (selectedStore) {
      localStorage.setItem(lastStoreKey, selectedStore.id)
    } else {
      localStorage.removeItem(lastStoreKey)
    }
  }, [lastStoreKey, selectedStore])

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

  function updateVoiceItem(index: number, field: keyof PurchaseItem, value: string | number) {
    const newItems = [...voiceItems]
    const item = newItems[index]!

    if (field === 'name') {
      item.name = value as string
    } else if (field === 'quantity') {
      item.quantity = Number(value)
    } else if (field === 'unitPrice') {
      item.unitPrice = Number(value)
    }

    item.totalPrice = item.quantity * item.unitPrice
    setVoiceItems(newItems)
  }

  function handleSaved() {
    onSaved?.()
  }

  async function persistPurchase(itemsToSave: PurchaseItem[], receiptImageUrl?: string | null) {
    const purchaseStore = await resolvePurchaseStore()
    const subtotal = itemsToSave.reduce((sum, item) => sum + item.totalPrice, 0)
    const normalizedDiscountPercent = Math.min(100, Math.max(0, discountPercent || 0))
    const discountAmount = Math.round(subtotal * (normalizedDiscountPercent / 100))
    await addPurchase(
      user!.uid,
      itemsToSave,
      receiptImageUrl ?? undefined,
      purchaseStore?.id,
      purchaseStore?.name,
      selectedDate,
      normalizedDiscountPercent,
      discountAmount
    )
  }

  async function savePurchaseWithFeedback(itemsToSave: PurchaseItem[], receiptImageUrl?: string | null) {
    setSaving(true)
    setMessage('')

    try {
      await persistPurchase(itemsToSave, receiptImageUrl)
      setMessage('Compra registrada correctamente')
      handleSaved()
      return true
    } catch (err) {
      console.error('Error al registrar la compra:', err)
      setMessage('Error al registrar la compra')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function resolvePurchaseStore(): Promise<Store | null> {
    if (selectedStore) return selectedStore

    const storeName = pendingStoreName.trim()
    if (!storeName) return null

    const createdStore = await stores.create({ name: storeName })
    setSelectedStore(createdStore)
    setPendingStoreName('')
    return createdStore
  }

  function openStoreManager() {
    navigate('/stores')
  }

  function addVoiceItem() {
    setVoiceItems([...voiceItems, { name: '', quantity: 0, unitPrice: 0, totalPrice: 0 }])
  }

  function removeItem(index: number) {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
    if (debounceTimersRef.current[index]) {
      clearTimeout(debounceTimersRef.current[index]!)
      delete debounceTimersRef.current[index]
    }
  }

  function removeVoiceItem(index: number) {
    if (voiceItems.length === 1) return
    setVoiceItems(voiceItems.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return

    const validItems = items.filter(item => item.name.trim() && item.quantity > 0 && item.unitPrice > 0)
    if (validItems.length === 0) {
      setMessage('Agregá al menos un producto válido')
      return
    }

    const saved = await savePurchaseWithFeedback(validItems)
    if (saved) {
      setItems([{ name: '', quantity: 0, unitPrice: 0, totalPrice: 0 }])
      setDiscountPercent(0)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const discountAmount = Math.round(subtotal * (Math.min(100, Math.max(0, discountPercent || 0)) / 100))
  const total = Math.max(0, subtotal - discountAmount)

  return (
    <DarkCard className="p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">
        Registrar compra
      </h2>

      {mode === 'manual' && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-text-muted">
              El establecimiento seleccionado queda guardado para la próxima compra.
            </p>
            <DarkButton variant="secondary" size="sm" onClick={openStoreManager}>
              Gestionar
            </DarkButton>
          </div>

          <StoreSelector
            stores={stores.stores}
            selectedStore={selectedStore}
            onSelect={setSelectedStore}
            onCreateInline={stores.create}
            onUpdateStore={stores.update}
            onDeleteStore={stores.remove}
            onDraftStoreNameChange={setPendingStoreName}
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
            resolveStore={resolvePurchaseStore}
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
              const validVoiceItems = items
                .filter((item) => item.name.trim() && item.quantity > 0 && item.unitPrice > 0)
                .map((item) => ({
                  name: item.name,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  totalPrice: item.totalPrice,
                }))

              if (validVoiceItems.length === 0) {
                setVoiceItems([])
                setMessage('No reconocimos productos. Reintenta o carga manualmente.')
                setMode('voice')
                return
              }

              setVoiceItems(validVoiceItems)
              setMode('voice-review')
            }}
            onBack={() => setMode('manual')}
          />
        </div>
      )}

      {mode === 'voice-review' && (
        <div className="mb-6">
          <DarkCard className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-text-primary">Revisá lo que entendió la voz</h3>
            <p className="text-sm text-text-secondary">
              Editá nombre, cantidad y precio antes de guardar.
            </p>

            <div className="space-y-3">
              {voiceItems.map((item, index) => (
                <div key={index} className="bg-bg-surface p-3 rounded-radius-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Item {index + 1}</span>
                    <DarkButton
                      variant="danger"
                      size="sm"
                      onClick={() => removeVoiceItem(index)}
                      disabled={voiceItems.length === 1}
                    >
                      ×
                    </DarkButton>
                  </div>

                  <DarkInput
                    label="Producto"
                    type="text"
                    value={item.name}
                    onChange={(e) => updateVoiceItem(index, 'name', e.target.value)}
                    placeholder="Ej: Harina pan"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <DarkInput
                      label="Cantidad"
                      type="number"
                      min="1"
                      required
                      value={item.quantity || ''}
                      onChange={(e) => updateVoiceItem(index, 'quantity', e.target.value)}
                      placeholder="3"
                    />
                    <DarkInput
                      label="Precio unitario"
                      type="number"
                      min="0"
                      step="10"
                      required
                      value={item.unitPrice || ''}
                      onChange={(e) => updateVoiceItem(index, 'unitPrice', e.target.value)}
                      placeholder="3000"
                    />
                  </div>

                  <div className="text-right">
                    <span className="text-sm text-text-secondary">
                      Subtotal: ${item.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <DarkButton
              variant="secondary"
              type="button"
              onClick={addVoiceItem}
            >
              + Agregar producto
            </DarkButton>

            <div className="pt-4 border-t border-border-subtle">
              <p className="text-lg font-semibold text-text-primary">
                Total: ${voiceItems.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
              </p>
            </div>

            {message && (
              <p className={`text-sm ${message.includes('Error') ? 'text-accent-red' : 'text-accent-green'}`}>
                {message}
              </p>
            )}

            <div className="flex gap-2">
              <DarkButton
                variant="primary"
                type="button"
                disabled={saving || voiceItems.length === 0}
                className="flex-1"
                onClick={() => {
                  const validVoiceItems = voiceItems.filter((item) => item.name.trim() && item.quantity > 0 && item.unitPrice > 0)
                  if (validVoiceItems.length === 0) {
                    setMessage('Agregá al menos un producto válido')
                    return
                  }

                  void (async () => {
                    const saved = await savePurchaseWithFeedback(validVoiceItems)
                    if (saved) {
                      setVoiceItems([])
                      setMode('manual')
                    }
                  })()
                }}
              >
                {saving ? 'Guardando...' : 'Confirmar y guardar compra'}
              </DarkButton>
              <DarkButton
                variant="secondary"
                type="button"
                onClick={() => {
                  setVoiceItems([])
                  setMode('voice')
                }}
                className="flex-1"
              >
                Regrabar
              </DarkButton>
            </div>
          </DarkCard>
        </div>
      )}

      {mode === 'manual' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-bg-surface border border-border-subtle rounded-radius-md p-3 space-y-4">
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="bg-bg-elevated p-3 rounded-radius-md space-y-3">
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
                  {index === 0 && (
                    <div className="space-y-3 border-t border-border-subtle pt-4">
                      <h3 className="text-sm font-medium text-text-primary">Descuento</h3>
                      <DarkInput
                        label="% de descuento"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={discountPercent || ''}
                        onChange={(e) => {
                          const nextPercent = Number(e.target.value)
                          setDiscountPercent(Number.isFinite(nextPercent) ? Math.min(100, Math.max(0, nextPercent)) : 0)
                        }}
                        placeholder="0"
                        prefix="%"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-1 border-t border-border-subtle">
              <p className="text-sm text-text-secondary">
                Subtotal: ${subtotal.toLocaleString()}
              </p>
              {discountAmount > 0 && (
                <p className="text-sm text-accent-green mt-1">
                  Descuento: -${discountAmount.toLocaleString()} ({Math.min(100, Math.max(0, discountPercent || 0))}%)
                </p>
              )}
              <p className="text-lg font-semibold text-text-primary">
                Total: ${total.toLocaleString()}
              </p>
            </div>
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
