import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { uploadReceiptImage } from './storage'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

vi.mock('firebase/storage')
vi.mock('@/config/firebase', () => ({
  storage: {},
  isConfigValid: true,
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
    vi.mocked(uploadBytes).mockResolvedValue({} as any)
    vi.mocked(getDownloadURL).mockResolvedValue('https://firebasestorage.googleapis.com/receipts/user-1/abc.jpg')

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    const url = await uploadReceiptImage('user-1', file, 'purchase-123')

    expect(ref).toHaveBeenCalledWith(expect.anything(), 'receipts/user-1/purchase-123.jpg')
    expect(uploadBytes).toHaveBeenCalled()
    expect(url).toBe('https://firebasestorage.googleapis.com/receipts/user-1/abc.jpg')
  })

  it('should convert all images to .jpg after compression', async () => {
    vi.mocked(uploadBytes).mockResolvedValue({} as any)
    vi.mocked(getDownloadURL).mockResolvedValue('https://firebasestorage.googleapis.com/receipts/user-1/abc.jpg')

    const file = new File(['dummy'], 'ticket.png', { type: 'image/png' })
    await uploadReceiptImage('user-1', file, 'purchase-456')

    expect(ref).toHaveBeenCalledWith(expect.anything(), 'receipts/user-1/purchase-456.jpg')
  })

  it('should throw if storage not initialized', async () => {
    vi.resetModules()
    vi.doMock('@/config/firebase', () => ({ storage: null, isConfigValid: false }))
    const { uploadReceiptImage: fn } = await import('./storage')
    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await expect(fn('user-1', file, 'purchase-789')).rejects.toThrow('Storage no inicializado')
    vi.doUnmock('@/config/firebase')
  })
})
