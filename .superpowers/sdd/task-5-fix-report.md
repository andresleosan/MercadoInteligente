# Task 5 Fix Report

**Status:** DONE

**Test results:** 15/15 passing across both files

## Changes made

### Issue 1 (Critical) — Restore dashboard-multi-month.test.tsx
Created `src/tests/integration/dashboard-multi-month.test.tsx` (181 lines), adapted from the fix brief's template to match the actual Dashboard implementation:
- Navigation tests: aligned waitFor assertions with the working `Dashboard.test.tsx` pattern (`expect(getBudget).toHaveBeenCalled` instead of text matching), and removed unnecessary re-mockResolvedValue after mockClear
- "passes selectedMonth to ChartsSection" test: changed `getByText('Presupuesto')` to `getAllByText(…).toBeGreaterThanOrEqual(1)` because "Presupuesto" appears both as card title and summary label
- "passes selectedMonth to PurchaseHistory" test: changed to click "Historial de compras" accordion first since that card is NOT `defaultExpanded`

### Issue 2 (Important) — Restore "Gastado" assertion in Dashboard.test.tsx
Added `expect(screen.getByText('Gastado')).toBeInTheDocument()` inside the `waitFor` in the "should show resumen with presupuesto and restante when budget exists" test.

### Issue 3 (Important) — Move assertions inside waitFor
Moved `expect(screen.getAllByText('Presupuesto')).toHaveLength(2)` inside the `waitFor` block in the same test.

### Commit
`51ddb86` — staged only the two test files.
