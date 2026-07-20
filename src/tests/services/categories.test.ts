import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/categories'
import { DEFAULT_CATEGORIES } from '@/services/defaultCategories'
import type { Category } from '@/types'

const dbState: { current: unknown } = { current: { id: 'mock-db' } }

vi.mock('@/config/firebase', () => ({
  get db() {
    return dbState.current
  },
}))

const mockCollection = vi.fn()
const mockGetDocs = vi.fn()
const mockAddDoc = vi.fn()
const mockUpdateDoc = vi.fn()
const mockDeleteDoc = vi.fn()
const mockDoc = vi.fn()
const mockQuery = vi.fn()
const mockWhere = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  where: (...args: unknown[]) => mockWhere(...args),
}))

describe('categories service', () => {
  const userId = 'test-user-123'

  beforeEach(() => {
    vi.clearAllMocks()
    dbState.current = { id: 'mock-db' }
  })

  describe('getCategories', () => {
    it('returns default categories plus user custom categories', async () => {
      const customDocs = [
        { id: 'cat-1', data: () => ({ name: 'Congelados', icon: '🧊', isDefault: false }) },
        { id: 'cat-2', data: () => ({ name: 'Mascotas', icon: '🐶', isDefault: false }) },
      ]
      mockCollection.mockReturnValue('categories-ref')
      mockGetDocs.mockResolvedValue({ docs: customDocs })

      const result = await getCategories(userId)

      expect(mockCollection).toHaveBeenCalledWith({ id: 'mock-db' }, 'users', userId, 'categories')
      expect(mockGetDocs).toHaveBeenCalledWith('categories-ref')
      expect(result).toHaveLength(DEFAULT_CATEGORIES.length + 2)
      expect(result[0]).toEqual(DEFAULT_CATEGORIES[0])
      expect(result[DEFAULT_CATEGORIES.length]).toEqual({
        id: 'cat-1',
        name: 'Congelados',
        icon: '🧊',
        isDefault: false,
      })
    })

    it('returns only defaults when user has no custom categories', async () => {
      mockCollection.mockReturnValue('categories-ref')
      mockGetDocs.mockResolvedValue({ docs: [] })

      const result = await getCategories(userId)

      expect(result).toEqual(DEFAULT_CATEGORIES)
    })

    it('throws when db is not initialized', async () => {
      dbState.current = null

      await expect(getCategories(userId)).rejects.toThrow('Firebase no inicializado')
    })
  })

  describe('createCategory', () => {
    it('adds a new custom category and returns it', async () => {
      mockCollection.mockReturnValue('categories-ref')
      mockAddDoc.mockResolvedValue({ id: 'new-cat-id' })

      const result = await createCategory(userId, 'Congelados', '🧊')

      expect(mockCollection).toHaveBeenCalledWith({ id: 'mock-db' }, 'users', userId, 'categories')
      expect(mockAddDoc).toHaveBeenCalledWith('categories-ref', {
        name: 'Congelados',
        icon: '🧊',
        isDefault: false,
      })
      expect(result).toEqual({
        id: 'new-cat-id',
        name: 'Congelados',
        icon: '🧊',
        isDefault: false,
      } as Category)
    })

    it('throws when db is not initialized', async () => {
      dbState.current = null

      await expect(createCategory(userId, 'X', 'Y')).rejects.toThrow('Firebase no inicializado')
    })
  })

  describe('updateCategory', () => {
    it('modifies an existing custom category', async () => {
      mockDoc.mockReturnValue('category-ref')

      await updateCategory(userId, 'cat-1', { name: 'Lácteos Premium' })

      expect(mockDoc).toHaveBeenCalledWith({ id: 'mock-db' }, 'users', userId, 'categories', 'cat-1')
      expect(mockUpdateDoc).toHaveBeenCalledWith('category-ref', { name: 'Lácteos Premium' })
    })

    it('sends only the provided fields', async () => {
      mockDoc.mockReturnValue('category-ref')

      await updateCategory(userId, 'cat-1', { icon: '🧀' })

      expect(mockUpdateDoc).toHaveBeenCalledWith('category-ref', { icon: '🧀' })
    })

    it('throws when db is not initialized', async () => {
      dbState.current = null

      await expect(updateCategory(userId, 'cat-1', { name: 'X' })).rejects.toThrow('Firebase no inicializado')
    })
  })

  describe('deleteCategory', () => {
    it('removes a custom category', async () => {
      mockDoc.mockReturnValue('category-ref')

      await deleteCategory(userId, 'cat-1')

      expect(mockDoc).toHaveBeenCalledWith({ id: 'mock-db' }, 'users', userId, 'categories', 'cat-1')
      expect(mockDeleteDoc).toHaveBeenCalledWith('category-ref')
    })

    it('throws when db is not initialized', async () => {
      dbState.current = null

      await expect(deleteCategory(userId, 'cat-1')).rejects.toThrow('Firebase no inicializado')
    })
  })
})
