### Task 7: Create CategoryBadge Component

**Files:**
- Create: `src/components/CategoryBadge.tsx`
- Create: `src/tests/components/CategoryBadge.test.tsx`

**Interfaces:**
- Consumes: `Category` type
- Produces: `CategoryBadge` component

- [ ] **Step 1: Write failing tests**

Create `src/tests/components/CategoryBadge.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryBadge } from '@/components/CategoryBadge'
import type { Category } from '@/types'

describe('CategoryBadge', () => {
  const mockCategory: Category = {
    id: 'lacteos',
    name: 'Lácteos',
    icon: '🥛',
    isDefault: true,
  }

  it('renders category icon and name', () => {
    render(<CategoryBadge category={mockCategory} />)
    expect(screen.getByText('🥛')).toBeInTheDocument()
    expect(screen.getByText('Lácteos')).toBeInTheDocument()
  })

  it('applies correct color classes for lacteos', () => {
    render(<CategoryBadge category={mockCategory} />)
    const badge = screen.getByText('Lácteos').closest('span')
    expect(badge?.className).toContain('blue')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/components/CategoryBadge.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement CategoryBadge component**

Create `src/components/CategoryBadge.tsx`:

```typescript
import type { Category } from '@/types'

interface CategoryBadgeProps {
  category: Category
  editable?: boolean
  onEdit?: () => void
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'lacteos': { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  'panaderia': { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  'carnes': { bg: 'bg-red-500/20', text: 'text-red-300' },
  'frutas-verduras': { bg: 'bg-green-500/20', text: 'text-green-300' },
  'bebidas': { bg: 'bg-cyan-500/20', text: 'text-cyan-300' },
  'limpieza': { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  'higiene': { bg: 'bg-pink-500/20', text: 'text-pink-300' },
  'snacks': { bg: 'bg-orange-500/20', text: 'text-orange-300' },
  'otro': { bg: 'bg-gray-500/20', text: 'text-gray-300' },
}

export function CategoryBadge({ category, editable, onEdit }: CategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category.id] ?? CATEGORY_COLORS['otro']

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.text} ${editable ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={editable ? onEdit : undefined}
    >
      <span>{category.icon}</span>
      <span>{category.name}</span>
    </span>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/components/CategoryBadge.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CategoryBadge.tsx src/tests/components/CategoryBadge.test.tsx
git commit -m "feat: add CategoryBadge component with color coding"
```

Notas:
- Mira otros componentes en `src/components/` (como `StoreBadge.tsx` si existe) para ver el patrón de badges en este codebase
- El código del brief es completo, solo transcríbelo
