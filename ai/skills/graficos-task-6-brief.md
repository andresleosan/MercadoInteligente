    })
  })

  it('should collapse when Ocultar grÃ¡ficos clicked', async () => {
    render(<ChartsSection userId="u1" selectedMonth="2026-07" />)
    fireEvent.click(screen.getByRole('button', { name: /ver grÃ¡ficos/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ocultar grÃ¡ficos/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /ocultar grÃ¡ficos/i }))
    expect(screen.getByRole('button', { name: /ver grÃ¡ficos/i })).toBeInTheDocument()
  })

  it('should show spinner fallback while loading ChartsContent', async () => {
    render(<ChartsSection userId="u1" selectedMonth="2026-07" />)
    fireEvent.click(screen.getByRole('button', { name: /ver grÃ¡ficos/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ocultar grÃ¡ficos/i })).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ChartsSection.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Crear `src/components/ChartsSection.tsx`:

```tsx
import { useState, lazy, Suspense } from 'react'

const ChartsContent = lazy(() => import('./ChartsContent'))

interface Props {
  userId: string
  selectedMonth: string
}

export default function ChartsSection({ userId, selectedMonth }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-white rounded-lg shadow p-4 text-left flex justify-between items-center hover:bg-gray-50"
      >
        <span className="text-lg font-semibold text-gray-900">
          ðŸ“Š {expanded ? 'Ocultar grÃ¡ficos' : 'Ver grÃ¡ficos'}
        </span>
        <span className="text-gray-400">{expanded ? 'â–²' : 'â–¼'}</span>
      </button>

      {expanded && (
        <div className="mt-4">