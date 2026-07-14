
- [ ] **Step 1: Add the function at the end of `src/services/budget.ts`**

Agregar despuÃ©s de `getAllBudgets`:

```ts
export async function getBudgetsByMonthRange(
  userId: string,
  monthsBack: number,
  referenceMonth: string
): Promise<Map<string, number>> {
  const budgets = new Map<string, number>()
  const [refYear, refMonthNum] = referenceMonth.split('-').map(Number)
  if (!refYear || !refMonthNum) return budgets

  const promises: Promise<void>[] = []
  for (let i = 0; i < monthsBack; i++) {
    const date = new Date(refYear, refMonthNum - 1 - i, 1)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    promises.push(
      getBudget(userId, month).then((budget) => {
        if (budget) {
          budgets.set(month, budget.amount)
        }
      })
    )
  }

  await Promise.all(promises)
  return budgets
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/services/budget.ts
git commit -m "feat(graficos): getBudgetsByMonthRange para cargar presupuestos de 6 meses"
```

---

## Task 3: `analytics.ts` â€” servicios de agregaciÃ³n

**Files:**
- Create: `src/services/analytics.ts`
- Test: `src/services/analytics.test.ts`

**Interfaces:**
- Consumes: `getPurchasesByDateRange` de `@/services/purchases`, `getBudgetsByMonthRange` de `@/services/budget`, `getPurchases` de `@/services/purchases`.