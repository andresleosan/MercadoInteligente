# Task 14: Refactorizar AddPurchase Page

**Files:**
- Modify: `src/pages/AddPurchase.tsx`

**Interfaces:**
- Consumes: DarkCard, DarkButton, DarkInput (Tasks 3-5)
- Produce: AddPurchase rediseñado con theme dark

## Steps

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/pages/AddPurchase.tsx
```

- [ ] **Step 2: Reemplazar imports y estructura**

Replace the AddPurchase page to use:
- DarkCard for the main container
- DarkInput for product name, quantity, and unit price fields
- DarkButton variants for actions (add, remove, save, cancel)
- Keep all business logic unchanged (state management, OCR, voice, navigation)
- Keep all modes (manual, photo, voice, review) working

- [ ] **Step 3: Ejecutar tests**

```bash
npx vitest run src/pages/AddPurchase.test.tsx
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/AddPurchase.tsx
git commit -m "feat(ui): redesign AddPurchase with dark theme

- DarkCard container
- DarkInput for product fields
- DarkButton variants for actions
- Consistent dark theme for all modes (manual, photo, voice, review)"
```
