import { useState, useEffect, useCallback } from 'react'
import { getStores, createStore, updateStore, deleteStore } from '@/services/stores'
import type { Store } from '@/types'

interface StoreData {
  name: string
  category?: string
  color?: string
  icon?: string
}

export function useStores(userId: string | null) {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      setError(null)
      const data = await getStores(userId)
      setStores(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar establecimientos')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(async (data: StoreData): Promise<Store> => {
    if (!userId) throw new Error('Usuario no autenticado')
    const store = await createStore(userId, data)
    setStores(prev => [...prev, store].sort((a, b) => a.name.localeCompare(b.name)))
    return store
  }, [userId])

  const update = useCallback(async (storeId: string, data: Partial<StoreData>) => {
    if (!userId) throw new Error('Usuario no autenticado')
    await updateStore(userId, storeId, data)
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, ...data } as Store : s))
  }, [userId])

  const remove = useCallback(async (storeId: string) => {
    if (!userId) throw new Error('Usuario no autenticado')
    await deleteStore(userId, storeId)
    setStores(prev => prev.filter(s => s.id !== storeId))
  }, [userId])

  return { stores, loading, error, create, update, remove, refresh }
}
