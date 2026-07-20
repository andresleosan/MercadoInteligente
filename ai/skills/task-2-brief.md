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
      onError?.('Permiso de microfono denegado')
    } else if (event.error === 'no-speech') {
      onError?.('No escuchamos nada. Reintenta.')
    } else if (event.error === 'aborted') {
      // ignore - user or timeout stopped
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
git commit -m "feat: voice service -- Web Speech API wrapper"
```
