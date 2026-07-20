# Budget Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Budget.tsx to use dark theme components (DarkCard, DarkInput, DarkButton) while preserving all business logic.

**Architecture:** Replace visual components only, keep state management, service calls, and error handling unchanged. Follow existing pattern from Login/Register pages.

**Tech Stack:** React, TypeScript, Tailwind CSS, custom dark components (DarkCard, DarkInput, DarkButton)

## Global Constraints
- NO modifying Firebase services, hooks, or routes
- NO adding new dependencies
- Only modify `src/pages/Budget.tsx`
- All tests must pass

---

### Task 1: Refactor BudgetPage to use dark theme components

**Files:**
- Modify: `src/pages/Budget.tsx`

**Interfaces:**
- Consumes: DarkCard, DarkButton, DarkInput (already implemented in Tasks 3-5)
- Produces: BudgetPage with dark theme styling

- [ ] **Step 1: Read current Budget.tsx to understand structure**

Run: `cat src/pages/Budget.tsx`
Expected: Shows current implementation with white card, standard input, green button

- [ ] **Step 2: Update imports to include dark components**

Replace the import section (lines 1-4) with:

```typescript
import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getBudget, setBudget } from '@/services/budget'
import type { Budget } from '@/types'
import { DarkCard } from '@/components/ui/DarkCard'
import { DarkInput } from '@/components/ui/DarkInput'
import { DarkButton } from '@/components/ui/DarkButton'
```

- [ ] **Step 3: Replace the loading spinner (lines 60-66) with dark-themed spinner**

Replace the loading spinner JSX with:

```tsx
if (loading) {
  return (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
    </div>
  )
}
```

- [ ] **Step 4: Replace the main container (lines 68-113) with DarkCard**

Replace the entire return statement (lines 68-113) with:

```tsx
return (
  <DarkCard className="p-6">
    <h2 className="text-xl font-semibold text-text-primary mb-4">
      Presupuesto mensual
    </h2>

    {budget && (
      <p className="text-sm text-text-secondary mb-4">
        Presupuesto actual: <span className="font-semibold text-text-primary">${budget.amount.toLocaleString()}</span>
      </p>
    )}

    <form onSubmit={handleSubmit} className="space-y-4">
      <DarkInput
        label="Monto mensual"
        type="number"
        min="0"
        step="100"
        required
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Ej: 50000"
        className="w-full"
      />

      {message && (
        <p className={`text-sm ${message.includes('Error') ? 'text-accent-red' : 'text-accent-green'}`}>
          {message}
        </p>
      )}

      <DarkButton
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2"
      >
        {saving ? 'Guardando...' : budget ? 'Actualizar presupuesto' : 'Crear presupuesto'}
      </DarkButton>
    </form>
  </DarkCard>
)
```

- [ ] **Step 5: Verify the refactored file compiles**

Run: `npx tsc --noEmit src/pages/Budget.tsx`
Expected: No TypeScript errors

- [ ] **Step 6: Run full test suite to ensure no regressions**

Run: `npx vitest run`
Expected: All tests pass (no specific Budget.test.tsx exists)

- [ ] **Step 7: Commit the changes**

```bash
git add src/pages/Budget.tsx
git commit -m "feat(ui): redesign BudgetPage with dark theme

- DarkCard primary container
- DarkInput for budget amount
- DarkButton primary for update
- Premium financial form layout"
```

## Verification

After implementation, verify:
1. Visual appearance matches dark theme (dark background, proper contrast)
2. Form functionality unchanged (can enter amount, submit, see messages)
3. Loading spinner still works
4. Error/success messages display correctly with dark theme colors
5. Button disabled state works (opacity-50)
6. All existing tests pass