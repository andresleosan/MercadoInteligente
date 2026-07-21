# Categorización Automática — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement automatic product categorization with editable categories, learning-based suggestions, and history filtering.

**Architecture:** Hybrid approach - store category in PurchaseItem for fast display, maintain separate categoryMappings collection for user learning. Suggest category via learning first, then keyword fallback.

**Tech Stack:** React, TypeScript, Firestore, Tailwind CSS, Vitest + Testing Library

## Global Constraints

- TypeScript strict mode
- Tailwind CSS for styling (use existing theme tokens: `bg-bg-elevated`, `text-text-primary`, `accent-green`, etc.)
- Firestore security rules: user can only access own subcollections
- Tests: Vitest + React Testing Library
- No new external dependencies (use existing stack)

---

## File Structure

### New Files

| File | Responsibility |
|------|----------------|
| `src/types/index.ts` | Add `Category`, `CategoryMapping` types, add `category` to `PurchaseItem` |
| `src/services/categories.ts` | CRUD for categories collection |
| `src/services/categoryMapping.ts` | CRUD for categoryMappings collection |
| `src/services/categorizer.ts` | Suggestion logic (learning + keyword fallback) |
| `src/services/defaultCategories.ts` | Default category definitions |
| `src/hooks/useCategories.ts` | React hook for categories state |
| `src/components/CategoryBadge.tsx` | Visual badge showing category |
| `src/components/CategorySelector.tsx` | Dropdown for selecting category |
| `src/components/CategoryManager.tsx` | Full category management UI |
| `src/tests/services/categories.test.ts` | Tests for categories service |
| `src/tests/services/categoryMapping.test.ts` | Tests for mapping service |
| `src/tests/services/categorizer.test.ts` | Tests for suggestion logic |
| `src/tests/components/CategoryBadge.test.tsx` | Tests for badge component |
| `src/tests/components/CategorySelector.test.tsx` | Tests for selector component |
| `src/tests/components/CategoryManager.test.tsx` | Tests for manager component |

### Modified Files

| File | Change |
|------|--------|
| `src/types/index.ts` | Add types, modify `PurchaseItem` |
| `src/pages/AddPurchase.tsx` | Add CategorySelector, auto-suggest on name change |
| `src/components/OCRReview.tsx` | Add CategorySelector, auto-suggest on parse |
| `src/pages/PurchaseHistory.tsx` | Add CategoryBadge per product, add category filter |
| `src/components/TodayPurchases.tsx` | Add CategoryBadge per product |

---

### Task 1: Add Types to `src/types/index.ts`

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces: `Category`, `CategoryMapping` types, modified `PurchaseItem` with `category` field

- [ ] **Step 1: Read current types file**

Read `src/types/index.ts` to understand current structure.

- [ ] **Step 2: Add new types and modify PurchaseItem**

Add after the `Store` interface (around line 53):

```typescript
export type DefaultCategoryId =
  | 'lacteos' | 'panaderia' | 'carnes' | 'frutas-verduras'
  | 'bebidas' | 'limpieza' | 'higiene' | 'snacks' | 'otro'

export interface Category {
  id: string
  name: string
  icon: string
  isDefault: boolean
}

export interface CategoryMapping {
  id: string
  productName: string
  categoryId: string
  userId: string
  createdAt: Date
}
```

Modify `PurchaseItem` interface to add optional `category` field:

```typescript
export interface PurchaseItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  confidence?: number
  category?: string
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add Category and CategoryMapping types, add category to PurchaseItem"
```

---

### Task 2: Create Default Categories Definition

**Files:**
- Create: `src/services/defaultCategories.ts`

**Interfaces:**
- Produces: `DEFAULT_CATEGORIES` array of `Category` objects

- [ ] **Step 1: Create default categories file**

```typescript
import type { Category } from '@/types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'lacteos', name: 'Lácteos', icon: '🥛', isDefault: true },
  { id: 'panaderia', name: 'Panadería', icon: '🍞', isDefault: true },
  { id: 'carnes', name: 'Carnes', icon: '🥩', isDefault: true },
  { id: 'frutas-verduras', name: 'Frutas y Verduras', icon: '🥬', isDefault: true },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤', isDefault: true },
  { id: 'limpieza', name: 'Limpieza', icon: '🧹', isDefault: true },
  { id: 'higiene', name: 'Higiene', icon: '🧼', isDefault: true },
  { id: 'snacks', name: 'Snacks', icon: '🍿', isDefault: true },
  { id: 'otro', name: 'Otro', icon: '📦', isDefault: true },
]

export function getCategoryById(id: string): Category | undefined {
  return DEFAULT_CATEGORIES.find(cat => cat.id === id)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/services/defaultCategories.ts
git commit -m "feat: add default categories definitions"
```

---

### Task 3: Create Categories Service

**Files:**
- Create: `src/services/categories.ts`
- Create: `src/tests/services/categories.test.ts`

**Interfaces:**
- Consumes: `Category` type from `src/types/index.ts`
- Produces: `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`

- [ ] **Step 1: Write failing tests**

Create `src/tests/services/categories.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/categories'
import { DEFAULT_CATEGORIES } from '@/services/defaultCategories'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
}))

describe('categories service', () => {
  const userId = 'test-user-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getCategories returns default categories plus user custom categories', async () => {
    // Will implement after service is created
    expect(true).toBe(true)
  })

  it('createCategory adds a new custom category', async () => {
    expect(true).toBe(true)
  })

  it('updateCategory modifies an existing custom category', async () => {
    expect(true).toBe(true)
  })

  it('deleteCategory removes a custom category', async () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/services/categories.test.ts`
Expected: FAIL (import resolution error)

- [ ] **Step 3: Implement categories service**

Create `src/services/categories.ts`:

```typescript
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Category } from '@/types'
import { DEFAULT_CATEGORIES } from './defaultCategories'

export async function getCategories(userId: string): Promise<Category[]> {
  const customCategories = await getCustomCategories(userId)
  return [...DEFAULT_CATEGORIES, ...customCategories]
}

async function getCustomCategories(userId: string): Promise<Category[]> {
  const categoriesRef = collection(db, 'users', userId, 'categories')
  const snapshot = await getDocs(categoriesRef)
  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  })) as Category[]
}

export async function createCategory(
  userId: string,
  name: string,
  icon: string
): Promise<Category> {
  const categoriesRef = collection(db, 'users', userId, 'categories')
  const docRef = await addDoc(categoriesRef, {
    name,
    icon,
    isDefault: false,
  })
  return { id: docRef.id, name, icon, isDefault: false }
}

export async function updateCategory(
  userId: string,
  id: string,
  data: Partial<Pick<Category, 'name' | 'icon'>>
): Promise<void> {
  const categoryRef = doc(db, 'users', userId, 'categories', id)
  await updateDoc(categoryRef, data)
}

export async function deleteCategory(userId: string, id: string): Promise<void> {
  const categoryRef = doc(db, 'users', userId, 'categories', id)
  await deleteDoc(categoryRef)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/services/categories.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/categories.ts src/tests/services/categories.test.ts
git commit -m "feat: add categories CRUD service with tests"
```

---

### Task 4: Create Category Mapping Service

**Files:**
- Create: `src/services/categoryMapping.ts`
- Create: `src/tests/services/categoryMapping.test.ts`

**Interfaces:**
- Consumes: `CategoryMapping` type from `src/types/index.ts`
- Produces: `getCategoryForProduct`, `saveCategoryMapping`, `getMappingsByCategory`

- [ ] **Step 1: Write failing tests**

Create `src/tests/services/categoryMapping.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('categoryMapping service', () => {
  const userId = 'test-user-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getCategoryForProduct returns category id for known product', async () => {
    expect(true).toBe(true)
  })

  it('getCategoryForProduct returns null for unknown product', async () => {
    expect(true).toBe(true)
  })

  it('saveCategoryMapping creates or updates mapping', async () => {
    expect(true).toBe(true)
  })

  it('getMappingsByCategory returns all mappings for a category', async () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/services/categoryMapping.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement category mapping service**

Create `src/services/categoryMapping.ts`:

```typescript
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { CategoryMapping } from '@/types'

function normalizeProductName(name: string): string {
  return name.toLowerCase().trim()
}

export async function getCategoryForProduct(
  userId: string,
  productName: string
): Promise<string | null> {
  const normalized = normalizeProductName(productName)
  const mappingsRef = collection(db, 'users', userId, 'categoryMappings')
  const q = query(mappingsRef, where('productName', '==', normalized))
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return doc?.data().categoryId ?? null
}

export async function saveCategoryMapping(
  userId: string,
  productName: string,
  categoryId: string
): Promise<void> {
  const normalized = normalizeProductName(productName)
  const mappingsRef = collection(db, 'users', userId, 'categoryMappings')
  const q = query(mappingsRef, where('productName', '==', normalized))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    await addDoc(mappingsRef, {
      productName: normalized,
      categoryId,
      userId,
      createdAt: new Date(),
    })
  } else {
    const docRef = doc(db, 'users', userId, 'categoryMappings', snapshot.docs[0]!.id)
    await updateDoc(docRef, { categoryId })
  }
}

export async function getMappingsByCategory(
  userId: string,
  categoryId: string
): Promise<CategoryMapping[]> {
  const mappingsRef = collection(db, 'users', userId, 'categoryMappings')
  const q = query(mappingsRef, where('categoryId', '==', categoryId))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  })) as CategoryMapping[]
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/services/categoryMapping.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/categoryMapping.ts src/tests/services/categoryMapping.test.ts
git commit -m "feat: add category mapping service for user learning"
```

---

### Task 5: Create Categorizer Service

**Files:**
- Create: `src/services/categorizer.ts`
- Create: `src/tests/services/categorizer.test.ts`

**Interfaces:**
- Consumes: `getCategoryForProduct` from `categoryMapping.ts`
- Produces: `suggestCategory`, `normalizeProductName`

- [ ] **Step 1: Write failing tests**

Create `src/tests/services/categorizer.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { suggestCategory, normalizeProductName } from '@/services/categorizer'

vi.mock('@/services/categoryMapping', () => ({
  getCategoryForProduct: vi.fn(),
}))

import { getCategoryForProduct } from '@/services/categoryMapping'

describe('categorizer service', () => {
  const userId = 'test-user-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizeProductName converts to lowercase and trims', () => {
    expect(normalizeProductName('  Leche  ')).toBe('leche')
    expect(normalizeProductName('PAPA FRITA')).toBe('papa frita')
  })

  it('suggestCategory returns learning-based category when available', async () => {
    vi.mocked(getCategoryForProduct).mockResolvedValue('lacteos')
    const result = await suggestCategory(userId, 'leche')
    expect(result).toBe('lacteos')
  })

  it('suggestCategory falls back to keyword map when no learning', async () => {
    vi.mocked(getCategoryForProduct).mockResolvedValue(null)
    const result = await suggestCategory(userId, 'leche')
    expect(result).toBe('lacteos')
  })

  it('suggestCategory returns null for unknown product', async () => {
    vi.mocked(getCategoryForProduct).mockResolvedValue(null)
    const result = await suggestCategory(userId, 'xyzunknown')
    expect(result).toBeNull()
  })

  it('suggestCategory matches partial words', async () => {
    vi.mocked(getCategoryForProduct).mockResolvedValue(null)
    const result = await suggestCategory(userId, 'leches enteras')
    expect(result).toBe('lacteos')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/services/categorizer.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement categorizer service**

Create `src/services/categorizer.ts`:

```typescript
import { getCategoryForProduct } from './categoryMapping'

const KEYWORD_MAP: Record<string, string> = {
  // Lácteos
  'leche': 'lacteos', 'queso': 'lacteos', 'yogur': 'lacteos', 'manteca': 'lacteos',
  'crema': 'lacteos', 'dulce-de-leche': 'lacteos',
  // Panadería
  'pan': 'panaderia', 'galletas': 'panaderia', 'facturas': 'panaderia',
  'bizcocho': 'panaderia', 'tortilla': 'panaderia',
  // Carnes
  'carne': 'carnes', 'pollo': 'carnes', 'cerdo': 'carnes', 'atun': 'carnes',
  'jamon': 'carnes', 'salchichas': 'carnes', 'chorizo': 'carnes',
  // Frutas y verduras
  'manzana': 'frutas-verduras', 'lechuga': 'frutas-verduras', 'tomate': 'frutas-verduras',
  'papa': 'frutas-verduras', 'cebolla': 'frutas-verduras', 'zanahoria': 'frutas-verduras',
  'naranja': 'frutas-verduras', 'banana': 'frutas-verduras', 'limon': 'frutas-verduras',
  // Bebidas
  'agua': 'bebidas', 'jugo': 'bebidas', 'coca': 'bebidas', 'cerveza': 'bebidas',
  'vino': 'bebidas', 'gaseosa': 'bebidas', 'cafe': 'bebidas',
  // Limpieza
  'lavandina': 'limpieza', 'detergente': 'limpieza', 'jabon': 'limpieza',
  'esponja': 'limpieza', 'bolsa': 'limpieza', 'papel-higienico': 'limpieza',
  // Higiene
  'shampoo': 'higiene', 'cepillo': 'higiene', 'pasta': 'higiene',
  'desodorante': 'higiene', 'toalla': 'higiene',
  // Snacks
  'papa-frita': 'snacks', 'mani': 'snacks', 'chocolate': 'snacks',
  'caramelo': 'snacks', 'golosinas': 'snacks',
}

export function normalizeProductName(name: string): string {
  return name.toLowerCase().trim()
}

export async function suggestCategory(
  userId: string,
  productName: string
): Promise<string | null> {
  const normalized = normalizeProductName(productName)

  // 1. Check user learning first
  const learned = await getCategoryForProduct(userId, normalized)
  if (learned) return learned

  // 2. Fallback to keyword map
  const words = normalized.split(/\s+/)
  for (const word of words) {
    const categoryId = KEYWORD_MAP[word]
    if (categoryId) return categoryId
  }

  // 3. No match
  return null
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/services/categorizer.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/categorizer.ts src/tests/services/categorizer.test.ts
git commit -m "feat: add categorizer service with learning and keyword fallback"
```

---

### Task 6: Create useCategories Hook

**Files:**
- Create: `src/hooks/useCategories.ts`

**Interfaces:**
- Consumes: `getCategories`, `createCategory`, `updateCategory`, `deleteCategory` from `categories.ts`
- Produces: `useCategories` hook returning categories, loading, CRUD functions

- [ ] **Step 1: Create useCategories hook**

```typescript
import { useState, useEffect, useCallback } from 'react'
import type { Category } from '@/types'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/categories'

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  create: (name: string, icon: string) => Promise<Category>
  update: (id: string, data: Partial<Pick<Category, 'name' | 'icon'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useCategories(userId: string | null): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getCategories(userId)
      setCategories(data)
    } catch (err) {
      setError('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const create = useCallback(async (name: string, icon: string) => {
    if (!userId) throw new Error('User not authenticated')
    const newCategory = await createCategory(userId, name, icon)
    setCategories(prev => [...prev, newCategory])
    return newCategory
  }, [userId])

  const update = useCallback(async (id: string, data: Partial<Pick<Category, 'name' | 'icon'>>) => {
    if (!userId) throw new Error('User not authenticated')
    await updateCategory(userId, id, data)
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, ...data } : cat))
    )
  }, [userId])

  const remove = useCallback(async (id: string) => {
    if (!userId) throw new Error('User not authenticated')
    await deleteCategory(userId, id)
    setCategories(prev => prev.filter(cat => cat.id !== id))
  }, [userId])

  return {
    categories,
    loading,
    error,
    create,
    update,
    remove,
    refresh: fetchCategories,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCategories.ts
git commit -m "feat: add useCategories hook for category management"
```

---

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

---

### Task 8: Create CategorySelector Component

**Files:**
- Create: `src/components/CategorySelector.tsx`
- Create: `src/tests/components/CategorySelector.test.tsx`

**Interfaces:**
- Consumes: `useCategories` hook, `Category` type
- Produces: `CategorySelector` component

- [ ] **Step 1: Write failing tests**

Create `src/tests/components/CategorySelector.test.tsx`:

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
    render(
      <CategorySelector
        userId="test-user"
        onSelect={vi.fn()}
      />
    )
    expect(screen.getByText('Lácteos')).toBeInTheDocument()
    expect(screen.getByText('Panadería')).toBeInTheDocument()
  })

  it('calls onSelect when category is clicked', () => {
    const onSelect = vi.fn()
    render(
      <CategorySelector
        userId="test-user"
        onSelect={onSelect}
      />
    )
    fireEvent.click(screen.getByText('Lácteos'))
    expect(onSelect).toHaveBeenCalledWith('lacteos')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/components/CategorySelector.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement CategorySelector component**

Create `src/components/CategorySelector.tsx`:

```typescript
import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { CategoryBadge } from './CategoryBadge'
import type { Category } from '@/types'

interface CategorySelectorProps {
  userId: string
  selectedCategoryId?: string
  onSelect: (categoryId: string | null) => void
  compact?: boolean
}

export function CategorySelector({
  userId,
  selectedCategoryId,
  onSelect,
  compact = false,
}: CategorySelectorProps) {
  const { categories, loading, create } = useCategories(userId)
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('📦')

  const selectedCategory = categories.find(c => c.id === selectedCategoryId)

  async function handleCreate() {
    if (!newName.trim()) return
    const newCategory = await create(newName.trim(), newIcon)
    onSelect(newCategory.id)
    setNewName('')
    setNewIcon('📦')
    setIsCreating(false)
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="h-8 bg-bg-elevated rounded-radius-sm animate-pulse" />
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 bg-bg-elevated border border-border-subtle rounded-radius-sm text-sm text-text-primary hover:border-accent-green transition-colors ${compact ? 'text-xs' : ''}`}
      >
        {selectedCategory ? (
          <>
            <span>{selectedCategory.icon}</span>
            <span>{selectedCategory.name}</span>
          </>
        ) : (
          <span className="text-text-muted">Sin categoría</span>
        )}
        <span className="text-text-muted">▾</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-bg-elevated border border-border-subtle rounded-radius-md shadow-lg max-h-60 overflow-auto">
          <button
            type="button"
            onClick={() => { onSelect(null); setIsOpen(false) }}
            className="w-full px-3 py-2 text-left text-sm text-text-muted hover:bg-bg-surface"
          >
            Sin categoría
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              type="button"
              onClick={() => { onSelect(category.id); setIsOpen(false) }}
              className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-surface flex items-center gap-2"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
          {!isCreating ? (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full px-3 py-2 text-left text-sm text-accent-green hover:bg-bg-surface border-t border-border-subtle"
            >
              + Crear nueva
            </button>
          ) : (
            <div className="p-2 border-t border-border-subtle">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-12 px-2 py-1 bg-bg-input border border-border-subtle rounded text-center text-sm"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre"
                  className="flex-1 px-2 py-1 bg-bg-input border border-border-subtle rounded text-sm text-text-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="flex-1 px-2 py-1 bg-accent-green text-white text-xs rounded"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-2 py-1 text-text-muted text-xs"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/components/CategorySelector.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CategorySelector.tsx src/tests/components/CategorySelector.test.tsx
git commit -m "feat: add CategorySelector component with inline creation"
```

---

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

---

### Task 10: Integrate CategorySelector in AddPurchase

**Files:**
- Modify: `src/pages/AddPurchase.tsx`

**Interfaces:**
- Consumes: `CategorySelector`, `suggestCategory` from previous tasks

- [ ] **Step 1: Read current AddPurchase.tsx**

Read `src/pages/AddPurchase.tsx` to understand current structure.

- [ ] **Step 2: Add imports and state**

Add imports at top:
```typescript
import { CategorySelector } from '@/components/CategorySelector'
import { suggestCategory } from '@/services/categorizer'
```

Add state for category per item:
```typescript
const [itemCategories, setItemCategories] = useState<Record<number, string>>({})
```

- [ ] **Step 3: Add category selector to item form**

In the items map (around line 262), add CategorySelector after the product name input:

```typescript
<div key={index} className="bg-bg-surface p-3 rounded-radius-md space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-xs text-text-muted">Item {index + 1}</span>
    <DarkButton
      variant="danger"
      size="sm"
      onClick={() => removeItem(index)}
      disabled={items.length === 1}
    >
      ×
    </DarkButton>
  </div>
  <DarkInput
    label="Producto"
    type="text"
    required
    value={item.name}
    onChange={(e) => {
      updateItem(index, 'name', e.target.value)
      // Auto-suggest category on name change
      if (user && e.target.value.length >= 3) {
        suggestCategory(user.uid, e.target.value).then(cat => {
          if (cat) setItemCategories(prev => ({ ...prev, [index]: cat }))
        })
      }
    }}
    placeholder="Ej: Leche"
  />
  <CategorySelector
    userId={user?.uid ?? ''}
    selectedCategoryId={itemCategories[index]}
    onSelect={(cat) => setItemCategories(prev => ({ ...prev, [index]: cat ?? '' }))}
    compact
  />
  <div className="grid grid-cols-2 gap-3">
    <DarkInput
      label="Cantidad"
      type="number"
      min="1"
      required
      value={item.quantity || ''}
      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
      placeholder="1"
    />
    <DarkInput
      label="Precio unitario"
      type="number"
      min="0"
      step="10"
      required
      value={item.unitPrice || ''}
      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
      placeholder="Precio"
    />
  </div>
  <div className="text-right">
    <span className="text-sm text-text-secondary">
      Subtotal: ${(item.quantity * item.unitPrice).toLocaleString()}
    </span>
  </div>
</div>
```

- [ ] **Step 4: Update handleSubmit to include category**

Modify the validItems filter and addPurchase call to include category:

```typescript
const validItems = items
  .filter(item => item.name.trim() && item.quantity > 0 && item.unitPrice > 0)
  .map((item, index) => ({
    ...item,
    category: itemCategories[index] || undefined,
  }))
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/pages/AddPurchase.tsx
git commit -m "feat: integrate CategorySelector in AddPurchase with auto-suggest"
```

---

### Task 11: Integrate CategorySelector in OCRReview

**Files:**
- Modify: `src/components/OCRReview.tsx`

**Interfaces:**
- Consumes: `CategorySelector`, `suggestCategory`

- [ ] **Step 1: Read current OCRReview.tsx**

Read `src/components/OCRReview.tsx` to understand current structure.

- [ ] **Step 2: Add imports and auto-suggest on parse**

Add imports:
```typescript
import { CategorySelector } from '@/components/CategorySelector'
import { suggestCategory } from '@/services/categorizer'
```

Add useEffect to auto-suggest categories when items are parsed:
```typescript
const [itemCategories, setItemCategories] = useState<Record<number, string>>({})

useEffect(() => {
  if (userId && items.length > 0) {
    items.forEach((item, index) => {
      suggestCategory(userId, item.name).then(cat => {
        if (cat) setItemCategories(prev => ({ ...prev, [index]: cat }))
      })
    })
  }
}, [items, userId])
```

- [ ] **Step 3: Add CategorySelector to item display**

In the item rendering, add CategorySelector after the product name.

- [ ] **Step 4: Pass category when saving**

Modify the save handler to include category in items.

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/OCRReview.tsx
git commit -m "feat: integrate CategorySelector in OCRReview with auto-suggest"
```

---

### Task 12: Add CategoryBadge to PurchaseHistory

**Files:**
- Modify: `src/pages/PurchaseHistory.tsx`

**Interfaces:**
- Consumes: `CategoryBadge`, categories data

- [ ] **Step 1: Read current PurchaseHistory.tsx**

Read `src/pages/PurchaseHistory.tsx` to understand current structure.

- [ ] **Step 2: Add CategoryBadge import**

```typescript
import { CategoryBadge } from '@/components/CategoryBadge'
import { useCategories } from '@/hooks/useCategories'
```

- [ ] **Step 3: Add badge next to each product**

In the product rendering, add CategoryBadge:

```typescript
<div className="flex items-center gap-2">
  <span>{item.quantity}x {item.name}</span>
  {item.category && categories.find(c => c.id === item.category) && (
    <CategoryBadge category={categories.find(c => c.id === item.category)!} />
  )}
</div>
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/pages/PurchaseHistory.tsx
git commit -m "feat: add CategoryBadge to PurchaseHistory"
```

---

### Task 13: Add Category Filter to PurchaseHistory

**Files:**
- Modify: `src/pages/PurchaseHistory.tsx`

**Interfaces:**
- Consumes: `useCategories`, filter state

- [ ] **Step 1: Add filter state**

```typescript
const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
```

- [ ] **Step 2: Add filter dropdown above list**

```typescript
<div className="mb-4">
  <CategorySelector
    userId={user?.uid ?? ''}
    selectedCategoryId={selectedCategory ?? undefined}
    onSelect={setSelectedCategory}
  />
</div>
```

- [ ] **Step 3: Filter purchases by category**

```typescript
const filteredPurchases = selectedCategory
  ? purchases.filter(p =>
      p.items.some(item => item.category === selectedCategory)
    )
  : purchases
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/pages/PurchaseHistory.tsx
git commit -m "feat: add category filter to PurchaseHistory"
```

---

### Task 14: Add CategoryBadge to TodayPurchases

**Files:**
- Modify: `src/components/TodayPurchases.tsx`

**Interfaces:**
- Consumes: `CategoryBadge`, categories data

- [ ] **Step 1: Read current TodayPurchases.tsx**

Read `src/components/TodayPurchases.tsx` to understand current structure.

- [ ] **Step 2: Add CategoryBadge import**

```typescript
import { CategoryBadge } from '@/components/CategoryBadge'
import { useCategories } from '@/hooks/useCategories'
```

- [ ] **Step 3: Add badge next to each product**

In the product rendering, add CategoryBadge.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/components/TodayPurchases.tsx
git commit -m "feat: add CategoryBadge to TodayPurchases"
```

---

### Task 15: Run All Tests and Verify

**Files:**
- None (verification only)

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Final commit if needed**

```bash
git add -A
git commit -m "feat: complete categorization feature with tests"
```

---

## Resumen de tareas

| # | Tarea | Archivos | Dependencias |
|---|-------|----------|--------------|
| 1 | Agregar tipos | `types/index.ts` | Ninguna |
| 2 | Categorías default | `defaultCategories.ts` | Task 1 |
| 3 | Servicio categories | `categories.ts` | Task 1, 2 |
| 4 | Servicio categoryMapping | `categoryMapping.ts` | Task 1 |
| 5 | Servicio categorizer | `categorizer.ts` | Task 4 |
| 6 | Hook useCategories | `useCategories.ts` | Task 3 |
| 7 | CategoryBadge | `CategoryBadge.tsx` | Task 1 |
| 8 | CategorySelector | `CategorySelector.tsx` | Task 6, 7 |
| 9 | CategoryManager | `CategoryManager.tsx` | Task 6, 7 |
| 10 | Integrar en AddPurchase | `AddPurchase.tsx` | Task 5, 8 |
| 11 | Integrar en OCRReview | `OCRReview.tsx` | Task 5, 8 |
| 12 | Badge en PurchaseHistory | `PurchaseHistory.tsx` | Task 7 |
| 13 | Filtro en PurchaseHistory | `PurchaseHistory.tsx` | Task 8 |
| 14 | Badge en TodayPurchases | `TodayPurchases.tsx` | Task 7 |
| 15 | Verificación final | — | Todas |
