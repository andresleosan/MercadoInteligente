import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVoice } from './useVoice'

const mockStartListening = vi.fn()
const mockStopListening = vi.fn()

vi.mock('@/services/voice', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  startListening: (...args: any[]) => {
    mockStartListening(...args)
    return { stop: mockStopListening }
  },
}))

vi.mock('@/services/voiceParser', () => ({
  parseVoiceText: vi.fn((text: string) => {
    if (text.includes('leche')) {
      return [{ name: 'Leche', unitPrice: 1200, quantity: 1, totalPrice: 1200, confidence: 100 }]
    }
    return []
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useVoice', () => {
  it('inicia en idle', () => {
    const { result } = renderHook(() => useVoice())
    expect(result.current.status).toBe('idle')
    expect(result.current.items).toEqual([])
    expect(result.current.transcript).toBe('')
    expect(result.current.error).toBeNull()
  })

  it('startListening cambia a listening', () => {
    const { result } = renderHook(() => useVoice())
    act(() => { result.current.startListening() })
    expect(result.current.status).toBe('listening')
  })

  it('onResult con isFinal parsea items y pasa a done', () => {
    const { result } = renderHook(() => useVoice())
    act(() => { result.current.startListening() })

    const callArgs = mockStartListening.mock.calls[0]![0]
    act(() => { callArgs.onResult('compre leche a 1200', true) })

    expect(result.current.transcript).toBe('compre leche a 1200')
    expect(result.current.status).toBe('done')
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]!.name).toBe('Leche')
  })

  it('reset vuelve a idle', () => {
    const { result } = renderHook(() => useVoice())
    act(() => { result.current.startListening() })
    act(() => { result.current.reset() })
    expect(result.current.status).toBe('idle')
    expect(result.current.transcript).toBe('')
    expect(result.current.items).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('error setea estado error', () => {
    const { result } = renderHook(() => useVoice())
    act(() => { result.current.startListening() })

    const callArgs = mockStartListening.mock.calls[0]![0]
    act(() => { callArgs.onError?.('Permiso de microfono denegado') })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Permiso de microfono denegado')
  })
})
