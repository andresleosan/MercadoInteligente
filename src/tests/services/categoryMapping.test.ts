import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getCategoryForProduct,
  saveCategoryMapping,
  getMappingsByCategory,
} from '@/services/categoryMapping'

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
const mockDoc = vi.fn()
const mockQuery = vi.fn()
const mockWhere = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  where: (...args: unknown[]) => mockWhere(...args),
  serverTimestamp: () => ({ _serverTimestamp: true }),
}))

describe('categoryMapping service', () => {
  const userId = 'test-user-123'

  beforeEach(() => {
    vi.clearAllMocks()
    dbState.current = { id: 'mock-db' }
  })

  describe('getCategoryForProduct', () => {
    it('returns category id for known product', async () => {
      const docs = [
        { id: 'map-1', data: () => ({ productName: 'leche entera 1l', categoryId: 'lacteos' }) },
      ]
      mockCollection.mockReturnValue('mappings-ref')
      mockQuery.mockReturnValue('query-ref')
      mockGetDocs.mockResolvedValue({ docs, empty: false })

      const result = await getCategoryForProduct(userId, '  Leche Entera 1L  ')

      expect(mockCollection).toHaveBeenCalledWith(
        { id: 'mock-db' },
        'users',
        userId,
        'categoryMappings'
      )
      expect(mockWhere).toHaveBeenCalledWith('productName', '==', 'leche entera 1l')
      expect(mockGetDocs).toHaveBeenCalledWith('query-ref')
      expect(result).toBe('lacteos')
    })

    it('returns null for unknown product', async () => {
      mockCollection.mockReturnValue('mappings-ref')
      mockQuery.mockReturnValue('query-ref')
      mockGetDocs.mockResolvedValue({ docs: [], empty: true })

      const result = await getCategoryForProduct(userId, 'Producto Desconocido')

      expect(result).toBeNull()
    })

    it('throws when db is not initialized', async () => {
      dbState.current = null

      await expect(getCategoryForProduct(userId, 'leche')).rejects.toThrow(
        'Firebase no inicializado'
      )
    })
  })

  describe('saveCategoryMapping', () => {
    it('creates a new mapping when none exists', async () => {
      mockCollection.mockReturnValue('mappings-ref')
      mockQuery.mockReturnValue('query-ref')
      mockGetDocs.mockResolvedValue({ docs: [], empty: true })
      mockAddDoc.mockResolvedValue({ id: 'new-map-id' })

      await saveCategoryMapping(userId, 'Pan Frances', 'panaderia')

      expect(mockWhere).toHaveBeenCalledWith('productName', '==', 'pan frances')
      expect(mockAddDoc).toHaveBeenCalledWith('mappings-ref', {
        productName: 'pan frances',
        categoryId: 'panaderia',
        createdAt: { _serverTimestamp: true },
      })
      expect(mockUpdateDoc).not.toHaveBeenCalled()
    })

    it('updates an existing mapping with the new category', async () => {
      const docs = [
        { id: 'existing-map', data: () => ({ productName: 'leche', categoryId: 'otro' }) },
      ]
      mockCollection.mockReturnValue('mappings-ref')
      mockQuery.mockReturnValue('query-ref')
      mockGetDocs.mockResolvedValue({ docs, empty: false })
      mockDoc.mockReturnValue('doc-ref')

      await saveCategoryMapping(userId, 'Leche', 'lacteos')

      expect(mockDoc).toHaveBeenCalledWith(
        { id: 'mock-db' },
        'users',
        userId,
        'categoryMappings',
        'existing-map'
      )
      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-ref', { categoryId: 'lacteos' })
      expect(mockAddDoc).not.toHaveBeenCalled()
    })

    it('throws when db is not initialized', async () => {
      dbState.current = null

      await expect(saveCategoryMapping(userId, 'leche', 'lacteos')).rejects.toThrow(
        'Firebase no inicializado'
      )
    })
  })

  describe('getMappingsByCategory', () => {
    it('returns all mappings for a category', async () => {
      const docs = [
        {
          id: 'map-1',
          data: () => ({
            productName: 'leche entera',
            categoryId: 'lacteos',
            userId,
            createdAt: new Date('2026-01-01'),
          }),
        },
        {
          id: 'map-2',
          data: () => ({
            productName: 'queso fresco',
            categoryId: 'lacteos',
            userId,
            createdAt: new Date('2026-01-02'),
          }),
        },
      ]
      mockCollection.mockReturnValue('mappings-ref')
      mockQuery.mockReturnValue('query-ref')
      mockGetDocs.mockResolvedValue({ docs })

      const result = await getMappingsByCategory(userId, 'lacteos')

      expect(mockCollection).toHaveBeenCalledWith(
        { id: 'mock-db' },
        'users',
        userId,
        'categoryMappings'
      )
      expect(mockWhere).toHaveBeenCalledWith('categoryId', '==', 'lacteos')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'map-1',
        productName: 'leche entera',
        categoryId: 'lacteos',
        userId,
        createdAt: new Date('2026-01-01'),
      })
      expect(result[1]).toEqual({
        id: 'map-2',
        productName: 'queso fresco',
        categoryId: 'lacteos',
        userId,
        createdAt: new Date('2026-01-02'),
      })
    })

    it('returns empty array when category has no mappings', async () => {
      mockCollection.mockReturnValue('mappings-ref')
      mockQuery.mockReturnValue('query-ref')
      mockGetDocs.mockResolvedValue({ docs: [] })

      const result = await getMappingsByCategory(userId, 'snacks')

      expect(result).toEqual([])
    })

    it('throws when db is not initialized', async () => {
      dbState.current = null

      await expect(getMappingsByCategory(userId, 'lacteos')).rejects.toThrow(
        'Firebase no inicializado'
      )
    })
  })
})
