import { describe, it, expect, beforeEach, vi } from 'vitest'
import { suggestCategory, normalizeProductName } from '@/services/categorizer'

vi.mock('@/services/categoryMapping', () => ({
  getCategoryForProduct: vi.fn(),
}))

import { getCategoryForProduct } from '@/services/categoryMapping'

describe('categorizer service', () => {
  const userId = 'test-user-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizeProductName converts to lowercase and trims', () => {
    expect(normalizeProductName('  Leche  ')).toBe('leche')
    expect(normalizeProductName('PAPA FRITA')).toBe('papa frita')
  })

  it('suggestCategory returns learning-based category when available', async () => {
    vi.mocked(getCategoryForProduct).mockResolvedValue('lacteos')
    const result = await suggestCategory(userId, 'leche')
    expect(result).toBe('lacteos')
  })

  it('suggestCategory falls back to keyword map when no learning', async () => {
    vi.mocked(getCategoryForProduct).mockResolvedValue(null)
    const result = await suggestCategory(userId, 'leche')
    expect(result).toBe('lacteos')
  })

  it('suggestCategory returns null for unknown product', async () => {
    vi.mocked(getCategoryForProduct).mockResolvedValue(null)
    const result = await suggestCategory(userId, 'xyzunknown')
    expect(result).toBeNull()
  })

  it('suggestCategory matches partial words', async () => {
    vi.mocked(getCategoryForProduct).mockResolvedValue(null)
    const result = await suggestCategory(userId, 'leches enteras')
    expect(result).toBe('lacteos')
  })
})
