### Task 8: Create CategorySelector Component

**Files:**
- Create: `src/components/CategorySelector.tsx`
- Create: `src/tests/components/CategorySelector.test.tsx`

**Interfaces:**
- Consumes: `useCategories` hook, `Category` type, `CategoryBadge` (optional)
- Produces: `CategorySelector` component (dropdown)

Lee el código completo en el plan `docs/superpowers/plans/2026-07-20-categorizacion-automatica.md` líneas 780-976.

El componente es un dropdown que:
- Lista categorías default + custom
- Permite crear nueva categoría inline
- Tiene variante compact
- Usa tokens de Tailwind del tema (`bg-bg-elevated`, `text-text-primary`, `border-border-subtle`, etc.)

## Tests (TDD)

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategorySelector } from '@/components/CategorySelector'

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 'lacteos', name: 'Lácteos', icon: '🥛', isDefault: true },
      { id: 'panaderia', name: 'Panadería', icon: '🍞', isDefault: true },
    ],
    loading: false,
    create: vi.fn(),
  }),
}))

describe('CategorySelector', () => {
  it('renders dropdown with categories', () => {
    render(<CategorySelector userId="test-user" onSelect={vi.fn()} />)
    expect(screen.getByText('Lácteos')).toBeInTheDocument()
    expect(screen.getByText('Panadería')).toBeInTheDocument()
  })

  it('calls onSelect when category is clicked', () => {
    const onSelect = vi.fn()
    render(<CategorySelector userId="test-user" onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Lácteos'))
    expect(onSelect).toHaveBeenCalledWith('lacteos')
  })
})
```

Nota: El test "renders dropdown with categories" requiere que el dropdown esté abierto para ver las categorías. El componente inicial muestra solo el botón. Ajusta:
- O el test abre el dropdown primero con fireEvent.click en el botón
- O el componente renderiza las categorías siempre (display none/block)

Recomendación: ajusta el test para hacer click en el botón primero y luego verificar las categorías.

## Commit

```bash
git add src/components/CategorySelector.tsx src/tests/components/CategorySelector.test.tsx
git commit -m "feat: add CategorySelector component with inline creation"
```
