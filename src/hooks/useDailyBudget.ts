import { useState, useEffect, useCallback } from 'react'
import { getDailyBudget, setDailyBudget } from '@/services/dailyBudget'
import type { DailyBudget } from '@/types'

export function useDailyBudget(userId: string | null, date: string, familyId?: string) {
  const [budget, setBudget] = useState<DailyBudget | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      setError(null)
      setLoading(true)
      const data = await getDailyBudget(userId, date, familyId)
      setBudget(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar presupuesto')
    } finally {
      setLoading(false)
    }
  }, [userId, date, familyId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(async (amount: number) => {
    if (!userId) throw new Error('Usuario no autenticado')
    await setDailyBudget(userId, date, amount, familyId)
    setBudget(prev =>
      prev
        ? { ...prev, amount, familyId, updatedAt: new Date() }
        : { id: date, userId, familyId, date, amount, createdAt: new Date(), updatedAt: new Date() }
    )
  }, [userId, date, familyId])

  return { budget, loading, error, save, refresh }
}
