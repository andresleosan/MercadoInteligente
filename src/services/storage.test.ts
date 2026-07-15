import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { uploadReceiptImage } from './storage'
import { supabase } from '@/services/supabase'

vi.mock('@/services/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
    },
  },
}))

beforeAll(() => {
  vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 100, height: 100, close: vi.fn() }))
  vi.stubGlobal('OffscreenCanvas', vi.fn().mockImplementation(() => ({
    getContext: () => ({
      drawImage: vi.fn(),
    }),
    convertToBlob: vi.fn().mockResolvedValue(new Blob(['compressed'], { type: 'image/jpeg' })),
  })))
})

describe('Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should upload compressed image and return URL', async () => {
    vi.mocked(supabase!.storage.from('receipts').upload).mockResolvedValue({ data: null, error: null })
    vi.mocked(supabase!.storage.from('receipts').getPublicUrl).mockReturnValue({
      data: { publicUrl: 'https://supabase.co/storage/v1/receipts/user-1/purchase-123.jpg' },
    })

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    const url = await uploadReceiptImage('user-1', file, 'purchase-123')

    expect(supabase!.storage.from('receipts').upload).toHaveBeenCalledWith(
      'user-1/purchase-123.jpg',
      expect.any(Blob),
      { contentType: 'image/jpeg', upsert: true }
    )
    expect(url).toBe('https://supabase.co/storage/v1/receipts/user-1/purchase-123.jpg')
  })

  it('should convert all images to .jpg after compression', async () => {
    vi.mocked(supabase!.storage.from('receipts').upload).mockResolvedValue({ data: null, error: null })
    vi.mocked(supabase!.storage.from('receipts').getPublicUrl).mockReturnValue({
      data: { publicUrl: 'https://supabase.co/storage/v1/receipts/user-1/purchase-456.jpg' },
    })

    const file = new File(['dummy'], 'ticket.png', { type: 'image/png' })
    await uploadReceiptImage('user-1', file, 'purchase-456')

    expect(supabase!.storage.from('receipts').upload).toHaveBeenCalledWith(
      'user-1/purchase-456.jpg',
      expect.any(Blob),
      { contentType: 'image/jpeg', upsert: true }
    )
  })

  it('should throw if storage not initialized', async () => {
    vi.resetModules()
    vi.doMock('@/services/supabase', () => ({ supabase: null }))
    const { uploadReceiptImage: fn } = await import('./storage')
    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await expect(fn('user-1', file, 'purchase-789')).rejects.toThrow('Storage no inicializado')
    vi.doUnmock('@/services/supabase')
  })
})
