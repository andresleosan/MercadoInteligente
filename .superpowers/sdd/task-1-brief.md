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
