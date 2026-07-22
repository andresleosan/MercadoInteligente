import { useState } from 'react'
import type { Store } from '@/types'

interface StoreSelectorProps {
  stores: Store[]
  selectedStore: Store | null
  onSelect: (store: Store | null) => void
  loading?: boolean
}

export default function StoreSelector({
  stores,
  selectedStore,
  onSelect,
  loading,
}: StoreSelectorProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function closeMenu() {
    setOpen(false)
    setError(null)
  }

  function selectStore(store: Store | null) {
    onSelect(store)
    closeMenu()
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

              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => selectStore(store)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-elevated transition-colors ${isSelected ? 'bg-accent-green/10 text-accent-green' : 'text-text-primary'}`}
                >
                  <span className="font-medium">{store.icon || ''} {store.name}</span>
                </button>
              )
            })}
          </div>
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
