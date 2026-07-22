import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import type { Category } from '@/types'
import {
  CATEGORY_ICON_OPTIONS,
  CategoryIcon,
  DEFAULT_CATEGORY_ICON_KEY,
  getCategoryIconOption,
  matchesCategoryIconSearch,
} from '@/config/categoryIcons'

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

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
  const [newIcon, setNewIcon] = useState(DEFAULT_CATEGORY_ICON_KEY)
  const [categoryQuery, setCategoryQuery] = useState('')
  const [iconQuery, setIconQuery] = useState('')
  const iconButtonRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const showCategorySearch = categories.length > 15
  const visibleCategories = useMemo(() => {
    const query = normalizeSearchValue(categoryQuery)

    if (!query) return categories

    return categories.filter((category) => {
      const iconLabel = getCategoryIconOption(category.icon).label
      return [category.name, category.id, iconLabel].some((value) => normalizeSearchValue(value).includes(query))
    })
  }, [categoryQuery, categories])

  const visibleIconOptions = useMemo(
    () => CATEGORY_ICON_OPTIONS.filter((option) => matchesCategoryIconSearch(option, iconQuery)),
    [iconQuery]
  )

  async function handleCreate() {
    if (!newName.trim()) return
    const newCategory = await create(newName.trim(), newIcon)
    onSelect(newCategory.id)
    setNewName('')
    setNewIcon(DEFAULT_CATEGORY_ICON_KEY)
    setCategoryQuery('')
    setIconQuery('')
    setIsCreating(false)
    setIsOpen(false)
  }

  function focusIconAt(index: number) {
    iconButtonRefs.current[index]?.focus()
  }

  function handleIconKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (visibleIconOptions.length === 0) return

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      focusIconAt(Math.min(index + 1, visibleIconOptions.length - 1))
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusIconAt(Math.max(index - 1, 0))
    }

    if (event.key === 'Home') {
      event.preventDefault()
      focusIconAt(0)
    }

    if (event.key === 'End') {
      event.preventDefault()
      focusIconAt(visibleIconOptions.length - 1)
    }
  }

  if (loading) {
    return <div className="h-8 bg-bg-elevated rounded-radius-sm animate-pulse" />
  }

  const triggerLabel = selectedCategory
    ? `${selectedCategory.icon} ${selectedCategory.name}`
    : 'Sin categoría'

  return (
    <div
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsOpen(false)
          setIsCreating(false)
        }
      }}
    >
      <button
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-3 px-3 py-2 bg-bg-elevated border border-border-subtle rounded-radius-md text-sm text-text-primary transition-all duration-200 hover:border-accent-green/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/30 ${compact ? 'text-xs' : ''}`}
      >
        <span className="flex min-w-0 items-center gap-2 text-left">
          {selectedCategory ? (
            <>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle bg-bg-surface/70 text-accent-green shadow-sm">
                <CategoryIcon icon={selectedCategory.icon} size={14} />
              </span>
              <span className="truncate">{selectedCategory.name}</span>
            </>
          ) : (
            <span className="text-text-muted">Sin categoría</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-[min(32rem,calc(100vw-1rem))] overflow-hidden rounded-radius-lg border border-border-subtle bg-bg-elevated shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="max-h-[min(34rem,calc(100vh-7rem))] overflow-auto">
            <div className="border-b border-border-subtle p-3">
              {showCategorySearch && (
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    type="search"
                    value={categoryQuery}
                    onChange={(event) => setCategoryQuery(event.target.value)}
                    placeholder="Buscar categoría"
                    aria-label="Buscar categoría"
                    className="h-10 w-full rounded-radius-md border border-border-subtle bg-bg-input pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/30"
                  />
                </label>
              )}

              <div className="mt-3 space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onSelect(null)
                    setIsOpen(false)
                    setCategoryQuery('')
                  }}
                  className="flex w-full items-center justify-between rounded-radius-md border border-transparent px-3 py-2 text-left text-sm text-text-muted transition-colors hover:border-border-subtle hover:bg-bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/30"
                >
                  <span>Sin categoría</span>
                  {!selectedCategory && <Check className="h-4 w-4 text-accent-green" />}
                </button>

                {visibleCategories.length > 0 ? (
                  visibleCategories.map((category: Category) => {
                    const isSelected = category.id === selectedCategoryId

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          onSelect(category.id)
                          setIsOpen(false)
                          setCategoryQuery('')
                        }}
                        className={`flex w-full items-center justify-between rounded-radius-md border px-3 py-2 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/30 ${isSelected ? 'border-accent-green/50 bg-accent-green/10 text-text-primary shadow-sm' : 'border-transparent text-text-primary hover:border-border-subtle hover:bg-bg-surface'}`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle bg-bg-surface/70 text-accent-green">
                            <CategoryIcon icon={category.icon} size={14} />
                          </span>
                          <span className="truncate">{category.name}</span>
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-accent-green" />}
                      </button>
                    )
                  })
                ) : (
                  <p className="rounded-radius-md border border-dashed border-border-subtle px-3 py-4 text-sm text-text-muted">
                    No hay categorías que coincidan con esa búsqueda.
                  </p>
                )}
              </div>
            </div>

            {!isCreating ? (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="flex w-full items-center gap-2 border-t border-border-subtle px-3 py-3 text-left text-sm text-accent-green transition-colors hover:bg-bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-green/30"
              >
                <Plus className="h-4 w-4" />
                Crear nueva categoría
              </button>
            ) : (
              <div className="border-t border-border-subtle p-3">
                <div className="rounded-radius-lg border border-border-subtle bg-bg-surface/70 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Nueva categoría</p>
                      <p className="text-xs text-text-muted">Elegí un nombre y un icono consistente.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false)
                        setIconQuery('')
                        setNewIcon(DEFAULT_CATEGORY_ICON_KEY)
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-colors hover:border-accent-green/40 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/30"
                      aria-label="Cancelar creación de categoría"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newName}
                      onChange={(event) => setNewName(event.target.value)}
                      placeholder="Nombre de la categoría"
                      className="h-10 w-full rounded-radius-md border border-border-subtle bg-bg-input px-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/30"
                      onKeyDown={(event) => event.key === 'Enter' && handleCreate()}
                    />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-xs font-medium uppercase tracking-wide text-text-muted">Icono</label>
                        <span className="text-xs text-text-muted">{getCategoryIconOption(newIcon).label}</span>
                      </div>

                      <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                        <input
                          type="search"
                          value={iconQuery}
                          onChange={(event) => setIconQuery(event.target.value)}
                          placeholder="Buscar icono"
                          aria-label="Buscar icono"
                          className="h-10 w-full rounded-radius-md border border-border-subtle bg-bg-input pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/30"
                        />
                      </label>

                      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
                        {visibleIconOptions.map((option, index) => {
                          const isSelected = newIcon === option.key

                          return (
                            <button
                              key={option.key}
                              ref={(element) => {
                                iconButtonRefs.current[index] = element
                              }}
                              type="button"
                              title={option.label}
                              aria-label={option.label}
                              aria-pressed={isSelected}
                              onClick={() => setNewIcon(option.key)}
                              onKeyDown={(event) => handleIconKeyDown(event, index)}
                              className={`group relative flex aspect-square items-center justify-center rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/30 ${isSelected ? 'border-accent-green/70 bg-accent-green/10 text-accent-green shadow-[0_12px_24px_rgba(16,185,129,0.16)] scale-[1.03]' : 'border-border-subtle bg-bg-input text-text-secondary hover:border-accent-green/40 hover:bg-bg-elevated hover:text-text-primary'}`}
                            >
                              <CategoryIcon icon={option.key} size={18} />
                              <span className="pointer-events-none absolute -bottom-7 left-1/2 z-10 -translate-x-1/2 rounded-full bg-bg-elevated px-2 py-1 text-[10px] font-medium text-text-secondary opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                                {option.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCreate}
                        disabled={!newName.trim()}
                        className="inline-flex flex-1 items-center justify-center rounded-radius-md bg-accent-green px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-green/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/30"
                      >
                        Guardar categoría
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreating(false)
                          setIconQuery('')
                          setNewIcon(DEFAULT_CATEGORY_ICON_KEY)
                        }}
                        className="inline-flex items-center justify-center rounded-radius-md border border-border-subtle px-3 py-2 text-sm text-text-muted transition-colors hover:border-accent-green/40 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/30"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
