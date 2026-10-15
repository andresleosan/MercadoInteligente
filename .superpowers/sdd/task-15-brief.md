# Task 15: Refactorizar PurchaseHistory Page

**Files:**
- Modify: `src/pages/PurchaseHistory.tsx`

**Interfaces:**
- Consumes: DarkCard, DarkButton, EmptyState (Tasks 3, 4, 8)
- Produce: PurchaseHistory rediseñado con theme dark y empty state

## Steps

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/pages/PurchaseHistory.tsx
```

- [ ] **Step 2: Reemplazar imports y estructura**

Replace the PurchaseHistory page to use:
- DarkCard primary for the main container
- DarkCard secondary for each purchase item
- EmptyState when no purchases exist
- DarkButton danger for delete action
- Keep all business logic unchanged (purchase service, state management, delete handling)

- [ ] **Step 3: Ejecutar tests**

```bash
npx vitest run src/pages/PurchaseHistory.test.tsx
```

If file doesn't exist, run full test suite: `npx vitest run`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/PurchaseHistory.tsx
git commit -m "feat(ui): redesign PurchaseHistory with dark theme

- DarkCard primary container
- DarkCard secondary for each purchase item
- EmptyState when no purchases
- DarkButton danger for delete
- Consistent dark theme"
```
