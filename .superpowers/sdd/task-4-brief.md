### Task 4: VoiceCapture component — microfono y transcripcion

**Files:**
- Create: `src/components/VoiceCapture.tsx`
- Create: `src/components/VoiceCapture.test.tsx`

**Interfaces:**
- Consumes: `useVoice` hook
- Produces: Component with `onDone(items: ParsedItem[])` callback

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
      error: 'Permiso de microfono denegado',
      startListening: vi.fn(),
      reset: vi.fn(),
    }))

    render(<VoiceCapture onDone={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText(/Permiso de microfono denegado/)).toBeTruthy()
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
        <p className="text-sm text-gray-600">Preparando microfono...</p>
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
git commit -m "feat: VoiceCapture component -- microfono y transcripcion"
```
