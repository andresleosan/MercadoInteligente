import { useState } from 'react'
import { PencilLine } from 'lucide-react'
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
  onUpdateStore: (storeId: string, data: StoreData) => Promise<void>
  onDeleteStore: (storeId: string) => Promise<void>
  onDraftStoreNameChange?: (name: string) => void
  loading?: boolean
}

export default function StoreSelector({
  stores,
  selectedStore,
  onSelect,
  onCreateInline,
  onUpdateStore,
  onDeleteStore,
  onDraftStoreNameChange,
  loading,
}: StoreSelectorProps) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [creatingStore, setCreatingStore] = useState(false)
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null)
  const [editingStoreName, setEditingStoreName] = useState('')
  const [updatingStore, setUpdatingStore] = useState(false)
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function closeMenu() {
    setOpen(false)
    setCreating(false)
    setEditingStoreId(null)
    setEditingStoreName('')
    setError(null)
  }

  function selectStore(store: Store | null) {
    onSelect(store)
    onDraftStoreNameChange?.('')
    closeMenu()
  }

  async function handleCreate() {
    if (!newStoreName.trim()) return
    setCreatingStore(true)
    setError(null)
    try {
      const store = await onCreateInline({ name: newStoreName.trim() })
      selectStore(store)
      setNewStoreName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el establecimiento')
    } finally {
      setCreatingStore(false)
    }
  }

  async function handleUpdate(storeId: string) {
    if (!editingStoreName.trim()) return
    setUpdatingStore(true)
    setError(null)
    try {
      await onUpdateStore(storeId, { name: editingStoreName.trim() })
      const updatedStore = stores.find((store) => store.id === storeId)
      if (updatedStore) {
        const nextStore = { ...updatedStore, name: editingStoreName.trim() }
        if (selectedStore?.id === storeId) {
          onSelect(nextStore)
        }
      }
      setEditingStoreId(null)
      setEditingStoreName('')
      setOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el establecimiento')
    }
    finally {
      setUpdatingStore(false)
    }
  }

  async function handleDelete(storeId: string) {
    const store = stores.find((entry) => entry.id === storeId)
    const confirmed = confirm(`¿Eliminar "${store?.name ?? 'este establecimiento'}"?\n\nLas compras asociadas no se eliminarán.`)
    if (!confirmed) return

    setDeletingStoreId(storeId)
    setError(null)
    try {
      await onDeleteStore(storeId)
      if (selectedStore?.id === storeId) {
        selectStore(null)
      }
      setOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el establecimiento')
    } finally {
      setDeletingStoreId(null)
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
    <div className="relative">
      <label className="block text-xs font-medium text-text-secondary mb-1.5">
        Establecimiento
      </label>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full h-10 px-3 flex items-center justify-between bg-bg-input border border-border-subtle rounded-radius-sm text-sm text-text-primary focus:outline-none focus:border-accent-green transition-colors"
      >
        <span className="truncate">
          {selectedStore ? `${selectedStore.icon || ''} ${selectedStore.name}`.trim() : 'Sin establecimiento'}
        </span>
        <span className="text-text-muted">▾</span>
      </button>

      {open && (
        <div className="mt-2 border border-border-subtle rounded-radius-md bg-bg-surface shadow-card overflow-hidden">
          <div className="max-h-72 overflow-auto divide-y divide-border-subtle">
            <button
              type="button"
              onClick={() => selectStore(null)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-elevated transition-colors ${selectedStore ? '' : 'bg-accent-green/10 text-accent-green'}`}
            >
              Sin establecimiento
            </button>

            {stores.map((store) => {
              const isSelected = selectedStore?.id === store.id
              const isEditing = editingStoreId === store.id
              const isDeleting = deletingStoreId === store.id

              if (isEditing) {
                return (
                  <div key={store.id} className="px-3 py-3 bg-elevated space-y-2">
                    <DarkInput
                      type="text"
                      value={editingStoreName}
                      onChange={(e) => setEditingStoreName(e.target.value)}
                      placeholder="Nuevo nombre"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          void handleUpdate(store.id)
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <DarkButton
                        variant="primary"
                        size="sm"
                        onClick={() => void handleUpdate(store.id)}
                        disabled={!editingStoreName.trim() || updatingStore}
                      >
                        {updatingStore ? '...' : 'Guardar'}
                      </DarkButton>
                      <DarkButton
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingStoreId(null)
                          setEditingStoreName('')
                        }}
                      >
                        Cancelar
                      </DarkButton>
                    </div>
                  </div>
                )
              }

              return (
                <div key={store.id} className={`px-3 py-2 flex items-center gap-2 ${isSelected ? 'bg-accent-green/10' : ''}`}>
                  <button
                    type="button"
                    onClick={() => selectStore(store)}
                    className="flex-1 text-left text-sm text-text-primary truncate"
                  >
                    <span className="font-medium">{store.icon || ''} {store.name}</span>
                  </button>
                  <DarkButton
                    variant="secondary"
                    size="sm"
                    aria-label={`Editar ${store.name}`}
                    onClick={() => {
                      setEditingStoreId(store.id)
                      setEditingStoreName(store.name)
                      setOpen(true)
                    }}
                    className="px-2"
                  >
                    <PencilLine size={14} />
                  </DarkButton>
                  <DarkButton
                    variant="danger"
                    size="sm"
                    onClick={() => void handleDelete(store.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? '...' : '×'}
                  </DarkButton>
                </div>
              )
            })}
          </div>

          {!creating ? (
            <div className="border-t border-border-subtle p-3">
              <DarkButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCreating(true)
                  setError(null)
                }}
                className="w-full"
              >
                + Crear nuevo
              </DarkButton>
            </div>
          ) : (
            <div className="border-t border-border-subtle p-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <DarkInput
                    type="text"
                    value={newStoreName}
                    onChange={(e) => {
                      const value = e.target.value
                      setNewStoreName(value)
                      onDraftStoreNameChange?.(value)
                    }}
                    placeholder="Nombre del establecimiento"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void handleCreate()
                      }
                    }}
                  />
                </div>
                <DarkButton
                  variant="primary"
                  size="sm"
                  onClick={() => void handleCreate()}
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
                    onDraftStoreNameChange?.('')
                  }}
                >
                  Cancelar
                </DarkButton>
              </div>
            </div>
          )}
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
