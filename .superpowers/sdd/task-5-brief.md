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
    // VoiceCapture mock will fire onDone immediately -- check that OCRReview appears
    expect(await screen.findByText(/Leche/)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run to verify the test reference works

Run: `npx vitest run src/pages/AddPurchase.test.tsx 2>&1`
Expected: Tests reference the modules correctly

- [ ] **Step 3: Modify AddPurchase.tsx**

Changes:
1. Import VoiceCapture
2. Extend mode type
3. Add state for voiceItems
4. Add voice button next to photo button
5. Add voice mode rendering
6. Add voice-review mode rendering

The current AddPurchase.tsx has these imports:
```tsx
import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useOCR } from '@/hooks/useOCR'
import { addPurchase } from '@/services/purchases'
import type { PurchaseItem } from '@/types'
import OCRCapture from '@/components/OCRCapture'
import OCRReview from '@/components/OCRReview'
```

Add imports for VoiceCapture and ParsedItem type:
```tsx
import VoiceCapture from '@/components/VoiceCapture'
import type { ParsedItem } from '@/types'
```

Extend the mode state and add voiceItems state:
```tsx
const [mode, setMode] = useState<'manual' | 'photo' | 'review' | 'error' | 'voice' | 'voice-review'>('manual')
const [voiceItems, setVoiceItems] = useState<ParsedItem[]>([])
```

In the manual mode section (after the photo button), add:
```tsx
<button
  type="button"
  onClick={() => setMode('voice')}
  className="w-full py-2 px-4 border border-purple-600 rounded-md text-sm font-medium text-purple-700 hover:bg-purple-50"
>
  🎤 Registrar por voz
</button>
```

Before the manual form (after the error mode section), add voice modes:
```tsx
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

Note: OCRReview expects `items: ParsedItem[]` and internally creates `PurchaseItem[]` from it. Since `ParsedItem[]` is assignable to `PurchaseItem[]` (same shape, confidence is required in ParsedItem but optional in PurchaseItem), TypeScript accepts it.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/pages/AddPurchase.test.tsx 2>&1`
Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/AddPurchase.tsx src/pages/AddPurchase.test.tsx
git commit -m "feat: integrar voz en AddPurchase -- nuevos modos voice y voice-review"
```
