import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getBudget, setBudget } from '@/services/budget'
import type { Budget } from '@/types'
import { DarkCard } from '@/components/ui/DarkCard'
import { DarkInput } from '@/components/ui/DarkInput'
import { DarkButton } from '@/components/ui/DarkButton'

interface Props {
  month?: string
  onSaved?: () => void
}

export default function BudgetPage({ month, onSaved }: Props) {
  const { user } = useAuth()
  const [budget, setBudgetState] = useState<Budget | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadBudget() {
      if (!user) return
      try {
        const currentBudget = await getBudget(user.uid, month)
        if (currentBudget) {
          setBudgetState(currentBudget)
          setAmount(String(currentBudget.amount))
        } else {
          setBudgetState(null)
          setAmount('')
        }
      } catch (err) {
        console.error('Error al cargar presupuesto:', err)
        setMessage('Error al cargar el presupuesto')
      } finally {
        setLoading(false)
      }
    }
    loadBudget()
  }, [user, month])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage('')

    try {
      const newBudget = await setBudget(user.uid, Number(amount), month)
      setBudgetState(newBudget)
      setMessage('Presupuesto guardado correctamente')
      if (onSaved) onSaved()
    } catch (err) {
      setMessage('Error al guardar el presupuesto')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
      </div>
    )
  }

  return (
    <DarkCard className="p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">
        Presupuesto mensual
      </h2>

      {budget && (
        <p className="text-sm text-text-secondary mb-4">
          Presupuesto actual: <span className="font-semibold text-text-primary">${budget.amount.toLocaleString()}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <DarkInput
          label="Monto mensual"
          type="number"
          min="0"
          step="100"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Ej: 50000"
          className="w-full"
        />

        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-accent-red' : 'text-accent-green'}`}>
            {message}
          </p>
        )}

        <DarkButton
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2"
        >
          {saving ? 'Guardando...' : budget ? 'Actualizar presupuesto' : 'Crear presupuesto'}
        </DarkButton>
      </form>
    </DarkCard>
  )
}
