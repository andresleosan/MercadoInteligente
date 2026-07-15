import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOCR } from '@/hooks/useOCR'
import { runOCR } from '@/services/ocr'

vi.mock('@/services/storage', () => ({
  uploadReceiptImage: vi.fn().mockResolvedValue('https://supabase.co/storage/v1/productos/user-1/abc.jpg'),
}))
vi.mock('@/services/ocr', () => ({
  runOCR: vi.fn().mockResolvedValue({
    text: 'Leche entera 1L          450.00\nPan integral            120,50',
    words: [
      { text: 'Leche', confidence: 90, bbox: { x0: 0, y0: 0, x1: 50, y1: 20 } },
      { text: 'entera', confidence: 85, bbox: { x0: 60, y0: 0, x1: 120, y1: 20 } },
      { text: '1L', confidence: 80, bbox: { x0: 130, y0: 0, x1: 150, y1: 20 } },
      { text: '450.00', confidence: 88, bbox: { x0: 200, y0: 0, x1: 250, y1: 20 } },
      { text: 'Pan', confidence: 75, bbox: { x0: 0, y0: 30, x1: 30, y1: 50 } },
      { text: 'integral', confidence: 70, bbox: { x0: 40, y0: 30, x1: 100, y1: 50 } },
      { text: '120,50', confidence: 72, bbox: { x0: 200, y0: 30, x1: 250, y1: 50 } },
    ],
  }),
}))
vi.mock('@/config/firebase', () => ({
  db: null,
}))

describe('useOCR', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should start in idle state', () => {
    const { result } = renderHook(() => useOCR('user-1'))
    expect(result.current.status).toBe('idle')
    expect(result.current.items).toHaveLength(0)
    expect(result.current.imageUrl).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should flow through uploading → ocr-running → parsing → done', async () => {
    const { result } = renderHook(() => useOCR('user-1'))

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await act(async () => {
      await result.current.processTicket(file)
    })

    expect(result.current.status).toBe('done')
    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0].name).toBe('Leche entera 1L')
    expect(result.current.imageUrl).toBe('https://supabase.co/storage/v1/productos/user-1/abc.jpg')
  })

  it('should set error state if OCR fails', async () => {
    vi.mocked(runOCR).mockRejectedValueOnce(new Error('OCR timeout'))

    const { result } = renderHook(() => useOCR('user-1'))

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await act(async () => {
      await result.current.processTicket(file)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toContain('No pudimos leer el ticket')
  })

  it('should do nothing if userId is null', async () => {
    const { result } = renderHook(() => useOCR(null))

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await act(async () => {
      await result.current.processTicket(file)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toContain('usuario')
  })

  it('should reset to idle', async () => {
    const { result } = renderHook(() => useOCR('user-1'))

    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await act(async () => {
      await result.current.processTicket(file)
    })
    expect(result.current.status).toBe('done')

    act(() => {
      result.current.reset()
    })
    expect(result.current.status).toBe('idle')
    expect(result.current.items).toHaveLength(0)
  })
})
