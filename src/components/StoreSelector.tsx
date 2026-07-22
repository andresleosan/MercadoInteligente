import { useState } from 'react'
import type { Store } from '@/types'
import { DarkInput } from '@/components/ui/DarkInput'
import { DarkButton } from '@/components/ui/DarkButton'

interface StoreData {
  name: string
  category?: string
  color?: string
  icon?: string
}

interface StoreSelectorProps {
  stores: Store[]
  selectedStore: Store | null
  onSelect: (store: Store | null) => void
  onCreateInline: (data: StoreData) => Promise<Store>
  loading?: boolean
}

export default function StoreSelector({
  stores,
  selectedStore,
  onSelect,
  onCreateInline,
  loading,
}: StoreSelectorProps) {
  const [creating, setCreating] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [creatingStore, setCreatingStore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!newStoreName.trim()) return
    setCreatingStore(true)
    setError(null)
    try {
      const store = await onCreateInline({ name: newStoreName.trim() })
      onSelect(store)
      setNewStoreName('')
      setCreating(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el establecimiento')
    } finally {
      setCreatingStore(false)
    }
  }

  function handleSelectChange(value: string) {
    setError(null)
    if (value === '__new__') {
      setCreating(true)
      onSelect(null)
    } else if (value === '') {
      onSelect(null)
    } else {
      const store = stores.find(s => s.id === value) || null
      onSelect(store)
    }
  }

  if (loading) {
    return (
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Establecimiento
        </label>
        <div className="h-10 bg-bg-input border border-border-subtle rounded-radius-sm animate-pulse" />
      </div>
    )
  }

  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">
        Establecimiento
      </label>

      {!creating ? (
        <select
          value={selectedStore?.id || ''}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full h-10 px-3 bg-bg-input border border-border-subtle rounded-radius-sm text-sm text-text-primary focus:outline-none focus:border-accent-green transition-colors"
        >
          <option value="">Sin establecimiento</option>
          {stores.map(store => (
            <option key={store.id} value={store.id}>
              {store.icon || ''} {store.name}
            </option>
          ))}
          <option value="__new__">+ Crear nuevo</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <div className="flex-1">
            <DarkInput
              type="text"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              placeholder="Nombre del establecimiento"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreate()
                }
              }}
            />
          </div>
          <DarkButton
            variant="primary"
            size="sm"
            onClick={handleCreate}
            disabled={!newStoreName.trim() || creatingStore}
          >
            {creatingStore ? '...' : 'Crear'}
          </DarkButton>
          <DarkButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setCreating(false)
              setNewStoreName('')
              setError(null)
            }}
          >
            Cancelar
          </DarkButton>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-accent-red">
          {error}
        </p>
      )}
    </div>
  )
}
