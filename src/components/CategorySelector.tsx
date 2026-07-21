import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import type { Category } from '@/types'

interface CategorySelectorProps {
  userId: string
  selectedCategoryId?: string
  onSelect: (categoryId: string | null) => void
  compact?: boolean
}

export function CategorySelector({
  userId,
  selectedCategoryId,
  onSelect,
  compact = false,
}: CategorySelectorProps) {
  const { categories, loading, create } = useCategories(userId)
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('📦')

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  async function handleCreate() {
    if (!newName.trim()) return
    const newCategory = await create(newName.trim(), newIcon)
    onSelect(newCategory.id)
    setNewName('')
    setNewIcon('📦')
    setIsCreating(false)
    setIsOpen(false)
  }

  if (loading) {
    return <div className="h-8 bg-bg-elevated rounded-radius-sm animate-pulse" />
  }

  const triggerLabel = selectedCategory
    ? `${selectedCategory.icon} ${selectedCategory.name}`
    : 'Sin categoría'

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={triggerLabel}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 bg-bg-elevated border border-border-subtle rounded-radius-sm text-sm text-text-primary hover:border-accent-green transition-colors ${compact ? 'text-xs' : ''}`}
      >
        {selectedCategory ? (
          <>
            <span>{selectedCategory.icon}</span>
            <span>{selectedCategory.name}</span>
          </>
        ) : (
          <span className="text-text-muted">Sin categoría</span>
        )}
        <span className="text-text-muted">▾</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-bg-elevated border border-border-subtle rounded-radius-md shadow-lg max-h-60 overflow-auto">
          <button
            type="button"
            onClick={() => {
              onSelect(null)
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 text-left text-sm text-text-muted hover:bg-bg-surface"
          >
            Sin categoría
          </button>
          {categories.map((category: Category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                onSelect(category.id)
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-surface flex items-center gap-2"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
          {!isCreating ? (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full px-3 py-2 text-left text-sm text-accent-green hover:bg-bg-surface border-t border-border-subtle"
            >
              + Crear nueva
            </button>
          ) : (
            <div className="p-2 border-t border-border-subtle">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-12 px-2 py-1 bg-bg-input border border-border-subtle rounded text-center text-sm"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre"
                  className="flex-1 px-2 py-1 bg-bg-input border border-border-subtle rounded text-sm text-text-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="flex-1 px-2 py-1 bg-accent-green text-white text-xs rounded"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-2 py-1 text-text-muted text-xs"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
