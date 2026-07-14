import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSpeechRecognition = vi.fn()
const mockStart = vi.fn()
const mockStop = vi.fn()
const mockAbort = vi.fn()

function createMockRecognition() {
  return {
    lang: '',
    continuous: false,
    interimResults: false,
    start: mockStart,
    stop: mockStop,
    abort: mockAbort,
    onresult: null,
    onend: null,
    onerror: null,
  }
}

let mockRecognition: ReturnType<typeof createMockRecognition>

beforeEach(() => {
  vi.resetAllMocks()
  mockRecognition = createMockRecognition()
  mockSpeechRecognition.mockImplementation(() => mockRecognition)
  ;(globalThis as any).SpeechRecognition = mockSpeechRecognition
  ;(globalThis as any).webkitSpeechRecognition = undefined
})

describe('startListening', () => {
  it('crea SpeechRecognition con configuracion correcta', async () => {
    const { startListening } = await import('./voice')
    const onResult = vi.fn()
    startListening({ onResult })

    expect(mockSpeechRecognition).toHaveBeenCalled()
    expect(mockRecognition.lang).toBe('es-AR')
    expect(mockRecognition.continuous).toBe(true)
    expect(mockRecognition.interimResults).toBe(true)
    expect(mockStart).toHaveBeenCalled()
  })

  it('onerror con not-allowed llama al callback de error', async () => {
    const { startListening } = await import('./voice')
    const onError = vi.fn()
    startListening({ onResult: vi.fn(), onError })

    mockRecognition.onerror!({ error: 'not-allowed' } as any)

    expect(onError).toHaveBeenCalledWith('Permiso de microfono denegado')
  })

  it('stop() detiene la grabacion', async () => {
    const { startListening } = await import('./voice')
    const result = startListening({ onResult: vi.fn() })

    result.stop()

    expect(mockStop).toHaveBeenCalled()
  })

  it('arroja error si SpeechRecognition no esta disponible', async () => {
    (globalThis as any).SpeechRecognition = undefined
    ;(globalThis as any).webkitSpeechRecognition = undefined

    const { startListening } = await import('./voice')
    const onError = vi.fn()
    startListening({ onResult: vi.fn(), onError })

    expect(onError).toHaveBeenCalledWith('Voz no disponible en este navegador')
  })
})
