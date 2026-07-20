import { useState, useEffect, useCallback } from 'react'
import type { Category } from '@/types'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/categories'

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  create: (name: string, icon: string) => Promise<Category>
  update: (id: string, data: Partial<Pick<Category, 'name' | 'icon'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useCategories(userId: string | null): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getCategories(userId)
      setCategories(data)
    } catch (err) {
      setError('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const create = useCallback(async (name: string, icon: string) => {
    if (!userId) throw new Error('User not authenticated')
    const newCategory = await createCategory(userId, name, icon)
    setCategories(prev => [...prev, newCategory])
    return newCategory
  }, [userId])

  const update = useCallback(async (id: string, data: Partial<Pick<Category, 'name' | 'icon'>>) => {
    if (!userId) throw new Error('User not authenticated')
    await updateCategory(userId, id, data)
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, ...data } : cat))
    )
  }, [userId])

  const remove = useCallback(async (id: string) => {
    if (!userId) throw new Error('User not authenticated')
    await deleteCategory(userId, id)
    setCategories(prev => prev.filter(cat => cat.id !== id))
  }, [userId])

  return {
    categories,
    loading,
    error,
    create,
    update,
    remove,
    refresh: fetchCategories,
  }
}
