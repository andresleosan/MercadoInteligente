import { useState } from 'react'
import { useDailyBudget } from '@/hooks/useDailyBudget'
import { useAuth } from '@/hooks/useAuth'
import { getTodayPurchases } from '@/services/purchases'
import { getCurrentDate } from '@/utils/date'
import { useEffect } from 'react'
import { ChevronDown, ChevronUp, PencilLine, Plus } from 'lucide-react'
import { DarkCard } from '@/components/ui/DarkCard'
import { DarkInput } from '@/components/ui/DarkInput'
import { DarkButton } from '@/components/ui/DarkButton'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface Props {
  date?: string
  onBudgetChange?: () => void
}

export default function DailyBudgetCard({ date, onBudgetChange }: Props) {
  const { user } = useAuth()
  const targetDate = date || getCurrentDate()
  const { budget, loading, save } = useDailyBudget(user?.uid ?? null, targetDate)
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [todaySpent, setTodaySpent] = useState(0)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [saveMode, setSaveMode] = useState<'add' | 'edit'>('edit')

  useEffect(() => {
    if (!user) return

    async function loadTodayData() {
      try {
        const purchases = await getTodayPurchases(user!.uid, targetDate)
        setTodaySpent(purchases.reduce((sum, p) => sum + p.total, 0))
      } catch (err) {
        console.error('Error cargando compras de hoy:', err)
      }
    }

    loadTodayData()
  }, [user, targetDate])

  useEffect(() => {
    if (budget?.amount && budget.amount > 0) {
      setIsEditorOpen(false)
      setSaveMode('add')
      setAmount('')
      return
    }

    setIsEditorOpen(true)
    setSaveMode('edit')
    setAmount('')
  }, [budget])

  const budgetAmount = budget?.amount || 0
  const hasBudget = budgetAmount > 0

  function openEditor(mode: 'add' | 'edit') {
    setMessage('')
    setSaveMode(mode)
    setIsEditorOpen(true)
    setAmount(mode === 'edit' && hasBudget ? String(budgetAmount) : '')
  }

  function toggleEditor() {
    if (isEditorOpen) {
      closeEditor()
      return
    }

    openEditor(hasBudget ? 'add' : 'edit')
  }

  function closeEditor() {
    if (!hasBudget) return
    setMessage('')
    setIsEditorOpen(false)
    setAmount('')
    setSaveMode('add')
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount < 0) {
      setMessage('Ingresá un monto válido')
      return
    }

    const nextAmount = hasBudget && saveMode === 'add'
      ? budgetAmount + numAmount
      : numAmount

    setSaving(true)
    setMessage('')
    try {
      await save(nextAmount)
      setMessage('Presupuesto guardado')
      setAmount('')
      if (nextAmount > 0) {
        setIsEditorOpen(false)
        setSaveMode('add')
      }
      onBudgetChange?.()
    } catch (err) {
      console.error('Error al guardar presupuesto diario:', err)
      setMessage(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DarkCard className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-bg-input rounded w-1/3" />
          <div className="h-8 bg-bg-input rounded w-1/2" />
        </div>
      </DarkCard>
    )
  }

  const percentage = budgetAmount > 0 ? (todaySpent / budgetAmount) * 100 : 0
  const isOverBudget = budgetAmount > 0 && todaySpent > budgetAmount
  const remaining = budgetAmount - todaySpent
  const editorLabel = saveMode === 'add' && hasBudget ? 'Sumar al presupuesto' : 'Monto diario'
  const editorHint = saveMode === 'add' && hasBudget
    ? 'Se sumará al total actual'
    : hasBudget
      ? 'Reemplaza el total actual'
      : 'Definí el presupuesto de hoy'
  const submitLabel = saving
    ? '...'
    : saveMode === 'add' && hasBudget
      ? 'Sumar'
      : hasBudget
        ? 'Guardar'
        : 'Guardar'

  return (
    <DarkCard className="p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Presupuesto diario</h2>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-text-secondary">Gastado hoy</p>
          <p className="text-lg font-bold text-accent-green">${todaySpent.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-secondary">Presupuesto</p>
          <p className="text-lg font-bold text-text-primary">
            {budgetAmount > 0 ? `$${budgetAmount.toLocaleString()}` : '—'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-secondary">
            {isOverBudget ? 'Excedido' : 'Restante'}
          </p>
          <p className={`text-lg font-bold ${isOverBudget ? 'text-accent-red' : 'text-accent-green'}`}>
            {budgetAmount > 0 ? `$${Math.abs(remaining).toLocaleString()}` : '—'}
          </p>
        </div>
      </div>

      {budgetAmount > 0 && (
        <div className="mb-4">
          <ProgressBar
            percentage={percentage}
            color={percentage > 100 ? 'red' : percentage > 80 ? 'amber' : 'green'}
          />
          <p className="text-xs text-text-muted mt-1 text-center">
            {percentage.toFixed(1)}% utilizado
          </p>
        </div>
      )}

      {!isEditorOpen && hasBudget ? (
        <button
          type="button"
          onClick={toggleEditor}
          className="w-full rounded-radius-md border border-border-subtle bg-bg-elevated/50 px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors hover:bg-bg-elevated"
          aria-label="Abrir editor de presupuesto"
        >
          <div>
            <p className="text-xs text-text-secondary">Presupuesto actual</p>
          </div>

          <ChevronDown size={16} className="text-text-muted shrink-0" />
        </button>
      ) : (
        <form onSubmit={handleSave} className="rounded-radius-md border border-border-subtle bg-bg-elevated/40 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text-primary">{editorLabel}</p>
              <p className="text-xs text-text-secondary">{editorHint}</p>
            </div>

            {hasBudget ? (
              <button
                type="button"
                onClick={closeEditor}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle text-text-secondary transition-colors hover:text-text-primary hover:bg-elevated"
                aria-label="Cerrar editor"
              >
                <ChevronUp size={16} />
              </button>
            ) : (
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle text-text-muted">
                <ChevronDown size={16} />
              </div>
            )}
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <DarkInput
                label="Monto diario"
                type="number"
                min="0"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={hasBudget && saveMode === 'add' ? 'Ej: 10000' : 'Ej: 50000'}
              />
            </div>

            <DarkButton
              variant="primary"
              size="sm"
              type="submit"
              disabled={saving}
            >
              {submitLabel}
            </DarkButton>
          </div>

          {hasBudget && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex gap-2">
                <DarkButton
                  variant={saveMode === 'add' ? 'primary' : 'secondary'}
                  size="sm"
                  type="button"
                  onClick={() => openEditor('add')}
                  className="flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Sumar
                </DarkButton>
                <DarkButton
                  variant={saveMode === 'edit' ? 'primary' : 'secondary'}
                  size="sm"
                  type="button"
                  onClick={() => openEditor('edit')}
                  className="flex items-center gap-1.5"
                >
                  <PencilLine size={14} />
                  Editar total
                </DarkButton>
              </div>

              <span className="text-text-muted">Guardado con Enter</span>
            </div>
          )}
        </form>
      )}

      {message && (
        <p className={`text-xs mt-2 ${message.includes('Error') ? 'text-accent-red' : 'text-accent-green'}`}>
          {message}
        </p>
      )}
    </DarkCard>
  )
}
