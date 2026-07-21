### Task 9: Create CategoryManager Component

**Files:**
- Create: `src/components/CategoryManager.tsx`
- Create: `src/tests/components/CategoryManager.test.tsx`

**Interfaces:**
- Consumes: `useCategories` hook
- Produces: `CategoryManager` component

- [ ] **Step 1: Write failing tests**

Create `src/tests/components/CategoryManager.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryManager } from '@/components/CategoryManager'

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 'lacteos', name: 'Lácteos', icon: '🥛', isDefault: true },
      { id: 'custom-1', name: 'Mi categoría', icon: '🎯', isDefault: false },
    ],
    loading: false,
    remove: vi.fn(),
  }),
}))

describe('CategoryManager', () => {
  it('renders all categories', () => {
    render(<CategoryManager userId="test-user" />)
    expect(screen.getByText('Lácteos')).toBeInTheDocument()
    expect(screen.getByText('Mi categoría')).toBeInTheDocument()
  })

  it('shows delete button only for custom categories', () => {
    render(<CategoryManager userId="test-user" />)
    const deleteButtons = screen.getAllByText('×')
    expect(deleteButtons.length).toBe(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/components/CategoryManager.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement CategoryManager component**

Create `src/components/CategoryManager.tsx`:

```typescript
import { useCategories } from '@/hooks/useCategories'
import { CategoryBadge } from './CategoryBadge'

interface CategoryManagerProps {
  userId: string
}

export function CategoryManager({ userId }: CategoryManagerProps) {
  const { categories, loading, remove } = useCategories(userId)

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-bg-elevated rounded-radius-sm animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {categories.map(category => (
        <div
          key={category.id}
          className="flex items-center justify-between p-3 bg-bg-elevated rounded-radius-md"
        >
          <CategoryBadge category={category} />
          {!category.isDefault && (
            <button
              onClick={() => remove(category.id)}
              className="text-text-muted hover:text-accent-red text-sm"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/components/CategoryManager.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CategoryManager.tsx src/tests/components/CategoryManager.test.tsx
git commit -m "feat: add CategoryManager component"
```
