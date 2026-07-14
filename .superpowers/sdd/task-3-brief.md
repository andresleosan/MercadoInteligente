### Task 3: useVoice hook — orquestador

**Files:**
- Create: `src/hooks/useVoice.ts`
- Create: `src/hooks/useVoice.test.ts`

**Interfaces:**
- Consumes: `startListening` from `./voice`, `parseVoiceText` from `./voiceParser`
- Produces: `function useVoice(): { status: VoiceStatus, items: ParsedItem[], transcript: string, error: string | null, startListening: () => void, reset: () => void }`

- [ ] **Step 1: Write the failing test**

```ts
// src/hooks/useVoice.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVoice } from './useVoice'

const mockStartListening = vi.fn()
const mockStopListening = vi.fn()

vi.mock('@/services/voice', () => ({
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/hooks/useVoice.test.ts 2>&1`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```ts
// src/hooks/useVoice.ts
import { useState, useCallback, useRef } from 'react'
import type { ParsedItem } from '@/types'
import { startListening } from '@/services/voice'
import { parseVoiceText } from '@/services/voiceParser'

export type VoiceStatus = 'idle' | 'listening' | 'transcribing' | 'parsing' | 'done' | 'error'

export function useVoice() {
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [items, setItems] = useState<ParsedItem[]>([])
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const stopRef = useRef<() => void>(() => {})
  const transcriptRef = useRef('')
  const statusRef = useRef(status)
  statusRef.current = status

  const reset = useCallback(() => {
    try { stopRef.current() } catch {}
    stopRef.current = () => {}
    transcriptRef.current = ''
    setStatus('idle')
    setItems([])
    setTranscript('')
    setError(null)
  }, [])

  const handleStart = useCallback(() => {
    setStatus('listening')
    setError(null)
    setItems([])
    setTranscript('')
    transcriptRef.current = ''

    const { stop } = startListening({
      onResult: (text: string, isFinal: boolean) => {
        transcriptRef.current = text
        setTranscript(text)
        if (isFinal) {
          setStatus('parsing')
          const parsed = parseVoiceText(text)
          if (parsed.length === 0) {
            setError('No reconocimos productos. Reintenta o carga manualmente.')
            setStatus('error')
          } else {
            setItems(parsed)
            setStatus('done')
          }
        }
      },
      onError: (msg: string) => {
        setError(msg)
        setStatus('error')
      },
      onEnd: () => {
        const currentTranscript = transcriptRef.current
        const currentStatus = statusRef.current
        if ((currentStatus === 'listening' || currentStatus === 'transcribing') && currentTranscript) {
          setStatus('parsing')
          const parsed = parseVoiceText(currentTranscript)
          if (parsed.length === 0) {
            setError('No reconocimos productos. Reintenta o carga manualmente.')
            setStatus('error')
          } else {
            setItems(parsed)
            setStatus('done')
          }
        }
      },
    })
    stopRef.current = stop
  }, [])

  return {
    status,
    items,
    transcript,
    error,
    startListening: handleStart,
    reset,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/hooks/useVoice.test.ts 2>&1`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useVoice.ts src/hooks/useVoice.test.ts
git commit -m "feat: useVoice hook -- orquestador de voz"
```
