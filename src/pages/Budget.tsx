import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getBudget, setBudget } from '@/services/budget'
import type { Budget } from '@/types'

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Presupuesto mensual
      </h2>

      {budget && (
        <p className="text-sm text-gray-600 mb-4">
          Presupuesto actual: <span className="font-semibold">${budget.amount.toLocaleString()}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Monto mensual
          </label>
          <input
            id="amount"
            type="number"
            min="0"
            step="100"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Ej: 50000"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : budget ? 'Actualizar presupuesto' : 'Crear presupuesto'}
        </button>
      </form>
    </div>
  )
}
