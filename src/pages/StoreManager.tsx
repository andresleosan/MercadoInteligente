import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useStores } from '@/hooks/useStores'
import type { Store } from '@/types'
import { DarkCard } from '@/components/ui/DarkCard'
import { DarkInput } from '@/components/ui/DarkInput'
import { DarkButton } from '@/components/ui/DarkButton'
import StoreBadge from '@/components/StoreBadge'

interface Props {
  onBack?: () => void
}

const CATEGORIES = [
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'tienda', label: 'Tienda' },
  { value: 'barrio', label: 'Tienda del barrio' },
  { value: 'otro', label: 'Otro' },
]

const COLORS = [
  '#10B981', '#3B82F6', '#EF4444', '#F59E0B',
  '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6',
]

const ICONS = ['🛒', '🏪', '🏬', '🏗️', '🛍️', '📦', '🏠', '💼']

export default function StoreManager({ onBack }: Props) {
  const { user } = useAuth()
  const stores = useStores(user?.uid ?? null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>('')
  const [color, setColor] = useState<string>('')
  const [icon, setIcon] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function resetForm() {
    setName('')
    setCategory('')
    setColor('')
    setIcon('')
    setEditingId(null)
  }

  function startEdit(store: Store) {
    setEditingId(store.id)
    setName(store.name)
    setCategory(store.category || '')
    setColor(store.color || '')
    setIcon(store.icon || '')
  }

  async function handleSave() {
    if (!name.trim()) {
      setMessage('El nombre es requerido')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      if (editingId) {
        await stores.update(editingId, {
          name: name.trim(),
          category: category || undefined,
          color: color || undefined,
          icon: icon || undefined,
        })
        setMessage('Establecimiento actualizado')
      } else {
        await stores.create({
          name: name.trim(),
          category: category || undefined,
          color: color || undefined,
          icon: icon || undefined,
        })
        setMessage('Establecimiento creado')
      }
      resetForm()
    } catch (err) {
      setMessage('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(storeId: string, storeName: string) {
    if (!confirm(`¿Eliminar "${storeName}"?\n\nLas compras asociadas no se eliminarán.`)) return

    try {
      await stores.remove(storeId)
      setMessage('Establecimiento eliminado')
      if (editingId === storeId) resetForm()
    } catch (err) {
      setMessage('Error al eliminar')
    }
  }

  return (
    <DarkCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Establecimientos</h2>
        {onBack && (
          <DarkButton variant="secondary" size="sm" onClick={onBack}>
            ← Volver
          </DarkButton>
        )}
      </div>

      {/* Formulario */}
      <div className="mb-6 p-4 bg-bg-input rounded-radius-md space-y-4">
        <DarkInput
          label="Nombre"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Ara, D1, Éxito..."
        />

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 px-3 bg-bg-base border border-border-subtle rounded-radius-sm text-sm text-text-primary focus:outline-none focus:border-accent-green transition-colors"
          >
            <option value="">Sin categoría</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(color === c ? '' : c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === c ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Icono</label>
          <div className="flex gap-2 flex-wrap">
            {ICONS.map(i => (
              <button
                key={i}
                onClick={() => setIcon(icon === i ? '' : i)}
                className={`w-10 h-10 rounded-lg border-2 text-lg flex items-center justify-center transition-all ${
                  icon === i ? 'border-accent-green bg-accent-green/10' : 'border-border-subtle hover:border-accent-green/50'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <DarkButton
            variant="primary"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? '...' : editingId ? 'Actualizar' : 'Crear'}
          </DarkButton>
          {editingId && (
            <DarkButton variant="secondary" onClick={resetForm}>
              Cancelar
            </DarkButton>
          )}
        </div>

        {message && (
          <p className={`text-xs ${message.includes('Error') ? 'text-accent-red' : 'text-accent-green'}`}>
            {message}
          </p>
        )}
      </div>

      {/* Lista de stores */}
      {stores.loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
        </div>
      ) : stores.stores.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-text-muted">No tenés establecimientos creados.</p>
          <p className="text-xs text-text-muted mt-1">Creá uno para empezar a asociar compras.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stores.stores.map(store => (
            <div
              key={store.id}
              className="flex items-center justify-between p-3 bg-bg-input rounded-radius-sm"
            >
              <div className="flex items-center gap-3">
                <StoreBadge store={store} size="md" />
                {store.category && (
                  <span className="text-xs text-text-muted capitalize">{store.category}</span>
                )}
              </div>
              <div className="flex gap-2">
                <DarkButton
                  variant="secondary"
                  size="sm"
                  onClick={() => startEdit(store)}
                >
                  Editar
                </DarkButton>
                <DarkButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(store.id, store.name)}
                >
                  ×
                </DarkButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </DarkCard>
  )
}
