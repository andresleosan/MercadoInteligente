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

Notas:
- Este servicio no toca Firebase directamente, solo consume `getCategoryForProduct` (ya mockeado en tests)
- El test "matches partial words" prueba que "leches" mapea a "lacteos" — ojo que solo hay "leche" en el KEYWORD_MAP, así que este test podría fallar. Si falla, ajusta el test o añade "leches" al KEYWORD_MAP. Decide cuál es mejor.
