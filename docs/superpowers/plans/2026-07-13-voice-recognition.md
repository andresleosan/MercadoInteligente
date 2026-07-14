# Registro por Voz — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add voice input for purchases via Web Speech API, reusing the same review/save pattern as OCR.

**Architecture:** `voice.ts` wraps Web Speech API → `voiceParser.ts` converts text to `ParsedItem[]` via regex → `useVoice.ts` hook orchestrates states → `VoiceCapture.tsx` shows mic/transcription → integrates as new mode in `AddPurchase.tsx`. Voice review reuses `OCRReview` directly (no new review component needed).

**Tech Stack:** Web Speech API (native browser), TypeScript, React, Vitest

**Branch:** `feat/voice-input` (crear desde master)

## Global Constraints
- No new dependencies — Web Speech API is nativa del browser
- No backend or API keys — everything runs client-side
- Reusar OCRReview para la pantalla de revisión (DRY)
- Tests con mocks de Web Speech API (no usar navegador real)
- `lang='es-AR'` para SpeechRecognition
- `continuous=true`, `interimResults=true`

---
## File Structure

**Create:**
- `src/services/voiceParser.ts` — texto → ParsedItem[]
- `src/services/voiceParser.test.ts` — tests del parser
- `src/services/voice.ts` — Web Speech API wrapper
- `src/services/voice.test.ts` — tests del servicio
- `src/hooks/useVoice.ts` — hook orquestador
- `src/hooks/useVoice.test.ts` — tests del hook
- `src/components/VoiceCapture.tsx` — micrófono + transcripción
- `src/components/VoiceCapture.test.tsx` — tests del componente

**Modify:**
- `src/pages/AddPurchase.tsx` — agregar modo "voice" + "voice-review"

**No new component needed:**
- VoiceReview → reusa `OCRReview` con `imageUrl={null}`

---

### Task 1: voiceParser — parsear texto a productos

**Files:**
- Create: `src/services/voiceParser.ts`
- Create: `src/services/voiceParser.test.ts`

**Interfaces:**
- Produces: `parseVoiceText(text: string): ParsedItem[]`

- [ ] **Step 1: Write the failing test**

```ts
// src/services/voiceParser.test.ts
import { describe, it, expect } from 'vitest'
import { parseVoiceText } from './voiceParser'

describe('parseVoiceText', () => {
  it('parsea "leche a 1200" como un item', () => {
    const result = parseVoiceText('leche a 1200')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Leche')
    expect(result[0]!.unitPrice).toBe(1200)
    expect(result[0]!.quantity).toBe(1)
  })

  it('parsea frase completa con varios items', () => {
    const result = parseVoiceText('compré leche a 1200, pan a 800, y 3 huevos a 2500')
    expect(result).toHaveLength(3)
    expect(result[0]!.name).toBe('Leche')
    expect(result[1]!.name).toBe('Pan')
    expect(result[2]!.name).toBe('Huevos')
    expect(result[2]!.quantity).toBe(3)
  })

  it('parsea "leche 1200" sin "a"', () => {
    const result = parseVoiceText('leche 1200')
    expect(result).toHaveLength(1)
    expect(result[0]!.unitPrice).toBe(1200)
  })

  it('filtra palabras vacías', () => {
    const result = parseVoiceText('compré leche a 1200')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Leche')
  })

  it('retorna array vacío si no hay productos detectables', () => {
    const result = parseVoiceText('hola cómo estás')
    expect(result).toHaveLength(0)
  })

  it('soporta números con punto de miles "1.200"', () => {
    const result = parseVoiceText('leche a 1.200')
    expect(result[0]!.unitPrice).toBe(1200)
  })

  it('texto vacío retorna array vacío', () => {
    expect(parseVoiceText('')).toHaveLength(0)
    expect(parseVoiceText('   ')).toHaveLength(0)
  })

  it('maneja "y" como separador', () => {
    const result = parseVoiceText('pan a 500 y leche a 1000')
    expect(result).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/services/voiceParser.test.ts 2>&1`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```ts
// src/services/voiceParser.ts
import type { ParsedItem } from '@/types'

const STOP_WORDS = /^(compré|compre|comprar|mercado|supermercado|fuimos|para|en|el|la|los|las|un|una|unas|unos|del)$/i
const SEGMENT_SEP = /[,;]?\s*(?:y\s+)?/g

const PATTERN_WITH_A = /^(?:(\d+)\s+)?(.+?)\s+a\s+(\d{1,3}(?:\.\d{3})*|\d+)$/
const PATTERN_WITHOUT_A = /^(?:(\d+)\s+)?(.+?)\s+(\d{1,3}(?:\.\d{3})*|\d+)$/

function parsePrice(raw: string): number {
  return parseInt(raw.replace(/\./g, ''), 10)
}

function cleanName(raw: string): string {
  return raw
    .replace(STOP_WORDS, '')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function parseVoiceText(text: string): ParsedItem[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const segments = trimmed
    .split(SEGMENT_SEP)
    .map((s) => s.trim())
    .filter(Boolean)

  const items: ParsedItem[] = []

  for (const segment of segments) {
    let quantity = 1
    let name = ''
    let unitPrice = 0

    const matchA = segment.match(PATTERN_WITH_A)
    const matchNoA = segment.match(PATTERN_WITHOUT_A)

    if (matchA) {
      quantity = matchA[1] ? parseInt(matchA[1], 10) : 1
      name = cleanName(matchA[2]!)
      unitPrice = parsePrice(matchA[3]!)
    } else if (matchNoA) {
      quantity = matchNoA[1] ? parseInt(matchNoA[1], 10) : 1
      name = cleanName(matchNoA[2]!)
      unitPrice = parsePrice(matchNoA[3]!)
    } else {
      continue
    }

    if (!name) continue

    items.push({
      name,
      unitPrice,
      quantity,
      totalPrice: unitPrice * quantity,
      confidence: 100,
    })
  }

  return items
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/services/voiceParser.test.ts 2>&1`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/voiceParser.ts src/services/voiceParser.test.ts
git commit -m "feat: voiceParser — texto a ParsedItem[]"
```

---

### Task 2: voice service — Web Speech API wrapper

**Files:**
- Create: `src/services/voice.ts`
- Create: `src/services/voice.test.ts`

**Interfaces:**
- Produces: `startListening(options: { onResult, onError, onEnd }): { stop: () => void }`

- [ ] **Step 1: Write the failing test**

```ts
// src/services/voice.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Web Speech API
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

    expect(onError).toHaveBeenCalledWith('Permiso de micrófono denegado')
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/services/voice.test.ts 2>&1`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```ts
// src/services/voice.ts
interface ListeningOptions {
  onResult: (text: string, isFinal: boolean) => void
  onError?: (message: string) => void
  onEnd?: () => void
}

const SILENCE_TIMEOUT_MS = 2000

export function startListening({ onResult, onError, onEnd }: ListeningOptions) {
  const SpeechRecognitionAPI =
    (globalThis as any).SpeechRecognition ?? (globalThis as any).webkitSpeechRecognition

  if (!SpeechRecognitionAPI) {
    onError?.('Voz no disponible en este navegador')
    return { stop: () => {} }
  }

  const recognition = new SpeechRecognitionAPI()
  recognition.lang = 'es-AR'
  recognition.continuous = true
  recognition.interimResults = true

  let silenceTimer: ReturnType<typeof setTimeout> | null = null
  let isStopped = false

  function resetSilenceTimer() {
    if (silenceTimer) clearTimeout(silenceTimer)
    if (isStopped) return
    silenceTimer = setTimeout(() => {
      stop()
    }, SILENCE_TIMEOUT_MS)
  }

  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript.trim()
      if (transcript) {
        onResult(transcript, event.results[i].isFinal)
        resetSilenceTimer()
      }
    }
  }

  recognition.onerror = (event: any) => {
    if (event.error === 'not-allowed') {
      onError?.('Permiso de micrófono denegado')
    } else if (event.error === 'no-speech') {
      onError?.('No escuchamos nada. Reintentá.')
    } else if (event.error === 'aborted') {
      // ignore — user or timeout stopped
    } else {
      onError?.(`Error de reconocimiento: ${event.error}`)
    }
  }

  recognition.onend = () => {
    if (silenceTimer) clearTimeout(silenceTimer)
    onEnd?.()
  }

  function stop() {
    isStopped = true
    if (silenceTimer) clearTimeout(silenceTimer)
    try { recognition.stop() } catch { /* already stopped */ }
  }

  recognition.start()
  resetSilenceTimer()

  return { stop }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/services/voice.test.ts 2>&1`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/voice.ts src/services/voice.test.ts
git commit -m "feat: voice service — Web Speech API wrapper"
```

---

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
    act(() => { callArgs.onResult('compré leche a 1200', true) })

    expect(result.current.transcript).toBe('compré leche a 1200')
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
    act(() => { callArgs.onError?.('Permiso de micrófono denegado') })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Permiso de micrófono denegado')
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

  const stopListening = useCallback(() => {
    stopRef.current()
    stopRef.current = () => {}
  }, [])

  const reset = useCallback(() => {
    stopListening()
    setStatus('idle')
    setItems([])
    setTranscript('')
    setError(null)
  }, [stopListening])

  const handleStart = useCallback(() => {
    setStatus('listening')
    setError(null)
    setItems([])
    setTranscript('')
    setStatus('listening')

    const { stop } = startListening({
      onResult: (text: string, isFinal: boolean) => {
        setTranscript(text)
        if (isFinal) {
          setStatus('parsing')
          const parsed = parseVoiceText(text)
          if (parsed.length === 0) {
            setError('No reconocimos productos. Reintentá o cargá manualmente.')
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
        if (status === 'listening' || status === 'transcribing') {
          const currentTranscript = transcript
          if (currentTranscript) {
            setStatus('parsing')
            const parsed = parseVoiceText(currentTranscript)
            if (parsed.length === 0) {
              setError('No reconocimos productos. Reintentá o cargá manualmente.')
              setStatus('error')
            } else {
              setItems(parsed)
              setStatus('done')
            }
          }
        }
      },
    })
    stopRef.current = stop
  }, [transcript])

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

Wait — the `onEnd` callback has a stale closure issue with `transcript` and `status`. Let me use refs instead.

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
            setError('No reconocimos productos. Reintentá o cargá manualmente.')
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
            setError('No reconocimos productos. Reintentá o cargá manualmente.')
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
git commit -m "feat: useVoice hook — orquestador de voz"
```

---

### Task 4: VoiceCapture component — micrófono y transcripción

**Files:**
- Create: `src/components/VoiceCapture.tsx`
- Create: `src/components/VoiceCapture.test.tsx`

**Interfaces:**
- Consumes: `useVoice` hook
- Produces: Componente con `onDone(items: ParsedItem[])` callback

- [ ] **Step 1: Write the failing test**

```ts
// src/components/VoiceCapture.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VoiceCapture from './VoiceCapture'

vi.mock('@/hooks/useVoice', () => ({
  useVoice: vi.fn(() => ({
    status: 'idle',
    items: [],
    transcript: '',
    error: null,
    startListening: vi.fn(),
    reset: vi.fn(),
  })),
}))

describe('VoiceCapture', () => {
  it('renderiza boton de microfono en estado idle', () => {
    const onDone = vi.fn()
    render(<VoiceCapture onDone={onDone} onBack={vi.fn()} />)
    expect(screen.getByRole('button', { name: /empezar/i })).toBeTruthy()
  })

  it('muestra transcripcion cuando cambia el texto', () => {
    const { useVoice } = require('@/hooks/useVoice')
    useVoice.mockImplementation(() => ({
      status: 'listening',
      items: [],
      transcript: 'leche a 1200',
      error: null,
      startListening: vi.fn(),
      reset: vi.fn(),
    }))

    render(<VoiceCapture onDone={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('leche a 1200')).toBeTruthy()
  })

  it('llama onDone cuando status es done', () => {
    const onDone = vi.fn()
    const { useVoice } = require('@/hooks/useVoice')
    useVoice.mockImplementation(() => ({
      status: 'done',
      items: [{ name: 'Leche', unitPrice: 1200, quantity: 1, totalPrice: 1200, confidence: 100 }],
      transcript: 'leche a 1200',
      error: null,
      startListening: vi.fn(),
      reset: vi.fn(),
    }))

    render(<VoiceCapture onDone={onDone} onBack={vi.fn()} />)
    expect(onDone).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Leche', unitPrice: 1200 }),
    ])
  })

  it('muestra mensaje de error', () => {
    const { useVoice } = require('@/hooks/useVoice')
    useVoice.mockImplementation(() => ({
      status: 'error',
      items: [],
      transcript: '',
      error: 'Permiso de micrófono denegado',
      startListening: vi.fn(),
      reset: vi.fn(),
    }))

    render(<VoiceCapture onDone={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText(/Permiso de micrófono denegado/)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/VoiceCapture.test.tsx 2>&1`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```ts
// src/components/VoiceCapture.tsx
import { useEffect } from 'react'
import type { ParsedItem } from '@/types'
import { useVoice } from '@/hooks/useVoice'

interface Props {
  onDone: (items: ParsedItem[]) => void
  onBack: () => void
}

export default function VoiceCapture({ onDone, onBack }: Props) {
  const { status, items, transcript, error, startListening, reset } = useVoice()

  useEffect(() => {
    if (status === 'done') {
      onDone(items)
    }
  }, [status, items, onDone])

  useEffect(() => {
    startListening()
    return () => { reset() }
  }, [startListening, reset])

  return (
    <div className="bg-white rounded-lg shadow p-6 text-center space-y-4">
      {status === 'idle' && (
        <p className="text-sm text-gray-600">Preparando micrófono...</p>
      )}

      {status === 'listening' && (
        <>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
              <span className="text-3xl">🎤</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">Escuchando...</p>
          {transcript && (
            <p className="text-base text-gray-900 italic border rounded p-3 bg-gray-50">
              {transcript}
            </p>
          )}
        </>
      )}

      {status === 'parsing' && (
        <p className="text-sm text-gray-600">Procesando productos...</p>
      )}

      {status === 'done' && (
        <p className="text-sm text-green-600">Productos reconocidos</p>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => { reset(); startListening() }}
              className="flex-1 py-1.5 px-3 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-1.5 px-3 border border-transparent rounded-md text-sm text-white bg-green-600 hover:bg-green-700"
            >
              Cargar manualmente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/VoiceCapture.test.tsx 2>&1`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/VoiceCapture.tsx src/components/VoiceCapture.test.tsx
git commit -m "feat: VoiceCapture component — microfono y transcripcion"
```

---

### Task 5: Integrar en AddPurchase — modo voz

**Files:**
- Modify: `src/pages/AddPurchase.tsx`
- Create: `src/pages/AddPurchase.test.tsx`

**Interfaces:**
- Consumes: `VoiceCapture`, `OCRReview` (reusado con `imageUrl={null}`)

- [ ] **Step 1: Write the failing integration test**

```ts
// src/pages/AddPurchase.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddPurchase from './AddPurchase'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { uid: 'test-uid' }, loading: false })),
}))

vi.mock('@/hooks/useOCR', () => ({
  useOCR: vi.fn(() => ({
    status: 'idle',
    items: [],
    imageUrl: null,
    error: null,
    processTicket: vi.fn(),
    reset: vi.fn(),
  })),
}))

vi.mock('@/hooks/useVoice', () => ({
  useVoice: vi.fn(() => ({
    status: 'idle',
    items: [],
    transcript: '',
    error: null,
    startListening: vi.fn(),
    reset: vi.fn(),
  })),
}))

vi.mock('@/components/VoiceCapture', () => ({
  default: ({ onDone }: any) => (
    <button onClick={() => onDone([{ name: 'Leche', unitPrice: 1200, quantity: 1, totalPrice: 1200, confidence: 100 }])}>
      VoiceCaptureMock
    </button>
  ),
}))

describe('AddPurchase', () => {
  it('renderiza botones de foto y voz en modo manual', () => {
    render(<AddPurchase />)
    expect(screen.getByText(/registrar por foto/i)).toBeTruthy()
    expect(screen.getByText(/registrar por voz/i)).toBeTruthy()
  })

  it('al hacer clic en voz, cambia a modo voice', async () => {
    render(<AddPurchase />)
    const user = userEvent.setup()
    await user.click(screen.getByText(/registrar por voz/i))
    expect(screen.getByText('VoiceCaptureMock')).toBeTruthy()
  })

  it('vuelve a manual con boton Volver desde voz', async () => {
    render(<AddPurchase />)
    const user = userEvent.setup()
    await user.click(screen.getByText(/registrar por voz/i))
    // VoiceCapture mock will fire onDone immediately — check that OCRReview appears
    expect(await screen.findByText(/Leche/)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run to verify the test reference works

Run: `npx vitest run src/pages/AddPurchase.test.tsx 2>&1`
Expected: Tests reference the modules correctly (could be FAIL until AddPurchase is modified).

- [ ] **Step 3: Modify AddPurchase.tsx**

Changes:
1. Import `useVoice` and `VoiceCapture`
2. Extend `mode` type: `'manual' | 'photo' | 'review' | 'error' | 'voice' | 'voice-review'`
3. Add voice button next to photo button
4. Add voice mode rendering (VoiceCapture)
5. Add voice-review mode rendering (reuses OCRReview with `imageUrl={null}`)

Key modifications in AddPurchase.tsx:

```tsx
// New imports
import { useVoice } from '@/hooks/useVoice'
import VoiceCapture from '@/components/VoiceCapture'

// Extended mode
const [mode, setMode] = useState<'manual' | 'photo' | 'review' | 'error' | 'voice' | 'voice-review'>('manual')

// Voice hook
const voice = useVoice()

// Voice handler
function handleVoiceDone(items: ParsedItem[]) {
  voice.items = items // already set by hook
  setMode('voice-review')
}
```

Add voice button after photo button (inside `mode === 'manual'`):
```tsx
<button
  type="button"
  onClick={() => setMode('voice')}
  className="w-full py-2 px-4 border border-purple-600 rounded-md text-sm font-medium text-purple-700 hover:bg-purple-50"
>
  🎤 Registrar por voz
</button>
```

Add voice mode rendering:
```tsx
{mode === 'voice' && (
  <div className="mb-6">
    <VoiceCapture
      onDone={(items) => {
        // set items into state for OCRReview
        setMode('voice-review')
        // Store voice items in a ref or state for OCRReview
        setVoiceItems(items)
      }}
      onBack={() => setMode('manual')}
    />
  </div>
)}

{mode === 'voice-review' && (
  <div className="mb-6">
    <OCRReview
      items={voiceItems}
      imageUrl={null}
      userId={user!.uid}
      onSaved={() => {
        setVoiceItems([])
        setMode('manual')
        setMessage('Compra registrada correctamente')
      }}
      onRetry={() => {
        setVoiceItems([])
        setMode('voice')
      }}
    />
  </div>
)}
```

Wait, I need to add a state for voice items since OCRReview expects `ParsedItem[]` and the mode `voice-review` needs to pass them to OCRReview. Let me add `const [voiceItems, setVoiceItems] = useState<ParsedItem[]>([])`.

Actually, looking at the existing AddPurchase code, it has `items` state which is `PurchaseItem[]`. OCRReview takes `ParsedItem[]` items. And the flow is:
1. OCRReview receives ParsedItem[]
2. OCRReview internally converts to PurchaseItem[] via `useState<PurchaseItem[]>(initialItems)` — wait, no, it does `useState<PurchaseItem[]>(initialItems)`, but `ParsedItem` and `PurchaseItem` have the same shape except `PurchaseItem` has optional `confidence`. Actually let me check types again.

```ts
export interface PurchaseItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  confidence?: number
}

export interface ParsedItem {
  name: string
  unitPrice: number
  quantity: number
  totalPrice: number
  confidence: number
}
```

They're compatible — `PurchaseItem` has `confidence?: number` vs `ParsedItem` has `confidence: number`. So `ParsedItem` is assignable to `PurchaseItem`. OCRReview does `useState<PurchaseItem[]>(initialItems)` where `initialItems` is `ParsedItem[]`. TypeScript should be OK with this because `ParsedItem[]` is a subtype of `PurchaseItem[]`.

So I can pass the parsed voice items directly to OCRReview. Good.

Let me write the actual modifications more carefully.

The full modified sections:

```tsx
// Add imports
import VoiceCapture from '@/components/VoiceCapture'

// Add state
const [mode, setMode] = useState<'manual' | 'photo' | 'review' | 'error' | 'voice' | 'voice-review'>('manual')
const [voiceItems, setVoiceItems] = useState<ParsedItem[]>([])

// In the JSX, for the manual mode, add the voice button after the photo button:
<button
  type="button"
  onClick={() => setMode('voice')}
  className="w-full py-2 px-4 border border-purple-600 rounded-md text-sm font-medium text-purple-700 hover:bg-purple-50"
>
  🎤 Registrar por voz
</button>

// Add voice mode:
{mode === 'voice' && (
  <div className="mb-6">
    <VoiceCapture
      onDone={(items) => {
        setVoiceItems(items)
        setMode('voice-review')
      }}
      onBack={() => setMode('manual')}
    />
  </div>
)}

// Add voice-review mode:
{mode === 'voice-review' && (
  <div className="mb-6">
    <OCRReview
      items={voiceItems}
      imageUrl={null}
      userId={user!.uid}
      onSaved={() => {
        setVoiceItems([])
        setMode('manual')
        setMessage('Compra registrada correctamente')
      }}
      onRetry={() => {
        setVoiceItems([])
        setMode('voice')
      }}
    />
  </div>
)}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/pages/AddPurchase.test.tsx 2>&1`
Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/AddPurchase.tsx src/pages/AddPurchase.test.tsx
git commit -m "feat: integrar voz en AddPurchase — nuevos modos voice y voice-review"
```

---

### Task 6: Typecheck + full suite + build verification

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run 2>&1`
Expected: All tests PASS (88 + new)

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit 2>&1`
Expected: No errors

- [ ] **Step 3: Build**

Run: `npm run build 2>&1`
Expected: Build succeeds

- [ ] **Step 4: Commit and status**

```bash
git add -A
git commit -m "chore: typecheck + build — Fase 5 completa"
git status
```
