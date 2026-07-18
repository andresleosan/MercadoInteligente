import { useState } from 'react'
import { useDailyBudget } from '@/hooks/useDailyBudget'
import { useStores } from '@/hooks/useStores'
import { useAuth } from '@/hooks/useAuth'
import { getTodayPurchases } from '@/services/purchases'
import { getStoreBudgets, setStoreBudget } from '@/services/storeBudget'
import { getCurrentDate } from '@/utils/date'
import { useEffect } from 'react'
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
  const stores = useStores(user?.uid ?? null)
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [todaySpent, setTodaySpent] = useState(0)
  const [storeAmounts, setStoreAmounts] = useState<Record<string, string>>({})
  const [storeBudgetList, setStoreBudgetList] = useState<Array<{ storeId: string; storeName: string; amount: number }>>([])

  useEffect(() => {
    if (!user) return

    async function loadTodayData() {
      const purchases = await getTodayPurchases(user!.uid, targetDate)
      setTodaySpent(purchases.reduce((sum, p) => sum + p.total, 0))

      const storeBudgets = await getStoreBudgets(user!.uid, targetDate)
      setStoreBudgetList(storeBudgets.map(sb => ({
        storeId: sb.storeId,
        storeName: sb.storeName,
        amount: sb.amount,
      })))
    }

    loadTodayData()
  }, [user, targetDate])

  useEffect(() => {
    if (budget) {
      setAmount(String(budget.amount))
    }
  }, [budget])

  async function handleSave() {
    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount < 0) {
      setMessage('Ingresá un monto válido')
      return
    }

    setSaving(true)
    setMessage('')
    try {
      await save(numAmount)
      setMessage('Presupuesto guardado')
      onBudgetChange?.()
    } catch {
      setMessage('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveStoreBudget(storeId: string, storeName: string) {
    const storeAmount = Number(storeAmounts[storeId] || '0')
    if (isNaN(storeAmount) || storeAmount < 0) return

    try {
      await setStoreBudget(user!.uid, targetDate, storeId, storeName, storeAmount)
      setStoreBudgetList(prev =>
        prev.map(sb => sb.storeId === storeId ? { ...sb, amount: storeAmount } : sb)
      )
      onBudgetChange?.()
    } catch {
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

  const budgetAmount = budget?.amount || 0
  const percentage = budgetAmount > 0 ? (todaySpent / budgetAmount) * 100 : 0
  const isOverBudget = budgetAmount > 0 && todaySpent > budgetAmount
  const remaining = budgetAmount - todaySpent

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

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <DarkInput
            label="Monto diario"
            type="number"
            min="0"
            step="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ej: 50000"
          />
        </div>
        <DarkButton
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '...' : 'Guardar'}
        </DarkButton>
      </div>

      {message && (
        <p className={`text-xs mt-2 ${message.includes('Error') ? 'text-accent-red' : 'text-accent-green'}`}>
          {message}
        </p>
      )}

      {stores.stores.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <p className="text-xs font-medium text-text-secondary mb-3">Presupuesto por tienda</p>
          <div className="space-y-3">
            {stores.stores.map(store => {
              const existingBudget = storeBudgetList.find(sb => sb.storeId === store.id)
              return (
                <div key={store.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <p className="text-xs text-text-muted">{store.icon || '🏪'} {store.name}</p>
                    <DarkInput
                      type="number"
                      min="0"
                      step="1000"
                      value={storeAmounts[store.id] || (existingBudget?.amount ? String(existingBudget.amount) : '')}
                      onChange={(e) => setStoreAmounts(prev => ({ ...prev, [store.id]: e.target.value }))}
                      placeholder="Monto"
                    />
                  </div>
                  <DarkButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSaveStoreBudget(store.id, store.name)}
                  >
                    Guardar
                  </DarkButton>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </DarkCard>
  )
}
