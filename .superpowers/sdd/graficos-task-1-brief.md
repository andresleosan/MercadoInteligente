- Produces: `getPurchasesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Purchase[]>`. Una query con `where('createdAt', '>=', startDate)` + `where('createdAt', '<=', endDate)` + `orderBy('createdAt', 'desc')`.

- [ ] **Step 1: Add the function at the end of `src/services/purchases.ts`**

Agregar despuÃ©s de `getTotalSpent` (lÃ­nea 93):

```ts
export async function getPurchasesByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Purchase[]> {
  if (!db || !isConfigValid) return []

  const purchasesRef = collection(db, 'users', userId, 'purchases')
  const q = query(
    purchasesRef,
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId,
      items: data.items,
      total: data.total,
      receiptImageUrl: data.receiptImageUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  })
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/services/purchases.ts
git commit -m "feat(graficos): getPurchasesByDateRange para query de 6 meses"
```

---

## Task 2: `getBudgetsByMonthRange` en `budget.ts`
