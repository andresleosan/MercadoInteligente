# Task 12: Refactorizar Register Page

**Files:**
- Modify: `src/pages/Register.tsx`
- Modify: `src/pages/Register.test.tsx` (actualizar selectors)

**Interfaces:**
- Consumes: DarkCard, DarkButton, DarkInput (Tasks 3-5)
- Produce: Register rediseñado con theme dark

## Steps

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/pages/Register.tsx
cat src/pages/Register.test.tsx
```

- [ ] **Step 2: Reemplazar imports y estructura de Register.tsx**

Replace the Register page to use:
- DarkCard for the form container
- DarkInput for name, email, and password fields
- DarkButton primary for submit
- Keep all business logic unchanged (auth service, error handling, navigation)

- [ ] **Step 3: Actualizar test selectors si es necesario**

Update test selectors to match new component structure. If Register.test.tsx doesn't exist, skip this step.

- [ ] **Step 4: Ejecutar tests**

```bash
npx vitest run src/pages/Register.test.tsx
```

If file doesn't exist, run full test suite: `npx vitest run`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Register.tsx src/pages/Register.test.tsx
git commit -m "feat(ui): redesign Register with dark theme

- Same layout as Login for consistency
- DarkCard, DarkInput, DarkButton
- Consistent with overall dark theme"
```
