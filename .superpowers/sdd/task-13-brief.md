# Task 13: Refactorizar Budget Page

**Files:**
- Modify: `src/pages/Budget.tsx`

**Interfaces:**
- Consumes: DarkCard, DarkButton, DarkInput (Tasks 3-5)
- Produce: BudgetPage rediseñado con theme dark

## Steps

- [ ] **Step 1: Leer el archivo actual**

```bash
cat src/pages/Budget.tsx
```

- [ ] **Step 2: Reemplazar imports y estructura**

Replace the Budget page to use:
- DarkCard for the form container
- DarkInput for budget amount field
- DarkButton primary for update/submit
- Keep all business logic unchanged (budget service, state management, error handling)

- [ ] **Step 3: Ejecutar tests**

```bash
npx vitest run src/pages/Budget.test.tsx
```

If file doesn't exist, run full test suite: `npx vitest run`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/Budget.tsx
git commit -m "feat(ui): redesign BudgetPage with dark theme

- DarkCard primary container
- DarkInput for budget amount
- DarkButton primary for update
- Premium financial form layout"
```

## Design Notes

### Current State
- White background card with gray borders
- Standard HTML input with green focus ring
- Green button with white text
- Simple layout with vertical spacing

### Target State
- DarkCard primary container with padding 6
- DarkInput for budget amount with label, placeholder, required
- DarkButton primary (gradient green) for submit
- Keep same business logic, error handling, loading spinner
- Maintain responsive layout (max-w-sm centered)

### Visual Consistency
- Follow Login/Register pattern: DarkCard with p-6, DarkInput with w-full, DarkButton with w-full
- Use same color tokens as other pages (text-primary, text-secondary, etc.)
- Keep loading spinner using existing CSS animation (can stay as is)

### Edge Cases
- Loading state spinner: keep existing implementation (works fine)
- Error/success messages: keep existing color logic (red/green) but ensure text colors match dark theme
- Button disabled state: DarkButton handles opacity

## Clarifying Question
Should we keep the same layout and spacing (p-6 on card, space-y-4 on form), or adjust padding/margins to match other dark-themed pages? The current Login/Register use p-6 on DarkCard and space-y-4 on form elements.

## Answer
Keeping the same layout and spacing as Login/Register pages (p-6 on DarkCard, space-y-4 on form elements) for consistency.
