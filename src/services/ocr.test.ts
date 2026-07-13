import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('tesseract.js', () => ({
  createWorker: vi.fn(),
  OEM: { LSTM_ONLY: 1, DEFAULT: 3 },
}))

describe('OCR Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should run OCR and return text + words', async () => {
    const { createWorker } = await import('tesseract.js')
    const mockRecognize = vi.fn().mockResolvedValue({
      data: {
        text: 'Leche entera 1L          450.00',
        words: [
          { text: 'Leche', confidence: 90, bbox: { x0: 0, y0: 0, x1: 50, y1: 20 } },
          { text: 'entera', confidence: 85, bbox: { x0: 60, y0: 0, x1: 120, y1: 20 } },
        ],
      },
    })
    const mockTerminate = vi.fn().mockResolvedValue(undefined)
    const mockSetParameters = vi.fn().mockResolvedValue(undefined)

    vi.mocked(createWorker).mockResolvedValue({
      recognize: mockRecognize,
      terminate: mockTerminate,
      setParameters: mockSetParameters,
    } as any)

    const { runOCR } = await import('./ocr')
    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    const result = await runOCR(file)

    expect(result.text).toContain('Leche')
    expect(result.words).toHaveLength(2)
    expect(result.words[0].text).toBe('Leche')
    expect(result.words[0].confidence).toBe(90)
    expect(mockTerminate).toHaveBeenCalled()
  })

  it('should use self-hosted models from /tessdata/', async () => {
    const { createWorker } = await import('tesseract.js')
    vi.mocked(createWorker).mockResolvedValue({
      recognize: vi.fn().mockResolvedValue({ data: { text: '', words: [] } }),
      terminate: vi.fn().mockResolvedValue(undefined),
      setParameters: vi.fn(),
    } as any)

    const { runOCR } = await import('./ocr')
    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    await runOCR(file)

    expect(createWorker).toHaveBeenCalledWith(
      'spa+eng',
      expect.anything(),
      expect.objectContaining({
        langPath: expect.stringContaining('/tessdata'),
        workerPath: expect.any(String),
        corePath: expect.any(String),
      })
    )
  })

  it('should timeout after 30 seconds', async () => {
    const { createWorker } = await import('tesseract.js')
    const mockRecognize = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { text: '', words: [] } }), 35000))
    )
    vi.mocked(createWorker).mockResolvedValue({
      recognize: mockRecognize,
      terminate: vi.fn().mockResolvedValue(undefined),
      setParameters: vi.fn(),
    } as any)

    const { runOCR } = await import('./ocr')
    const file = new File(['dummy'], 'ticket.jpg', { type: 'image/jpeg' })
    vi.useFakeTimers()
    const promise = runOCR(file)
    promise.catch(() => {})
    await vi.advanceTimersByTimeAsync(31000)
    await expect(promise).rejects.toThrow('OCR timeout')
    vi.useRealTimers()
  })
})
