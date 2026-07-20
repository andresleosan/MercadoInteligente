# Task 11: Refactorizar Login Page

**Files:**
- Modify: `src/pages/Login.tsx`
- Modify: `src/pages/Login.test.tsx` (actualizar selectors)

**Interfaces:**
- Consumes: DarkCard, DarkButton, DarkInput (Tasks 3-5)
- Produce: Login rediseñado con theme dark

## Steps

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/pages/Login.tsx
cat src/pages/Login.test.tsx
```

- [ ] **Step 2: Reemplazar imports y estructura de Login.tsx**

Replace the Login page to use:
- DarkCard for the form container
- DarkInput for email and password fields
- DarkButton primary for submit
- Keep all business logic unchanged (auth service, error handling, navigation)

- [ ] **Step 3: Actualizar test selectors si es necesario**

Update test selectors to match new component structure.

- [ ] **Step 4: Ejecutar tests**

```bash
npx vitest run src/pages/Login.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Login.tsx src/pages/Login.test.tsx
git commit -m "feat(ui): redesign Login with dark theme

- DarkCard centered layout
- DarkInput for email and password
- DarkButton primary for submit
- Consistent with overall dark theme"
```
