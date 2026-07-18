import { useState, useEffect, useCallback } from 'react'
import { getDailyBudget, setDailyBudget } from '@/services/dailyBudget'
import type { DailyBudget } from '@/types'

export function useDailyBudget(userId: string | null, date: string) {
  const [budget, setBudget] = useState<DailyBudget | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      setError(null)
      setLoading(true)
      const data = await getDailyBudget(userId, date)
      setBudget(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar presupuesto')
    } finally {
      setLoading(false)
    }
  }, [userId, date])

  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(async (amount: number) => {
    if (!userId) throw new Error('Usuario no autenticado')
    await setDailyBudget(userId, date, amount)
    setBudget(prev =>
      prev
        ? { ...prev, amount, updatedAt: new Date() }
        : { id: date, userId, date, amount, createdAt: new Date(), updatedAt: new Date() }
    )
  }, [userId, date])

  return { budget, loading, error, save, refresh }
}
