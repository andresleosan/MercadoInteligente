            }
          >
            <ChartsContent userId={userId} selectedMonth={selectedMonth} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ChartsSection.test.tsx`
Expected: PASS â€” 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/ChartsSection.tsx src/components/ChartsSection.test.tsx
git commit -m "feat(graficos): ChartsSection colapsable con lazy-load de Recharts"
```

---

## Task 6: Integrar `ChartsSection` en `Dashboard.tsx`

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Add import and component to Dashboard**

En `src/pages/Dashboard.tsx`:

1. Agregar import despuÃ©s de la lÃ­nea 11 (`import usePWAInstall`):
```ts
import ChartsSection from '@/components/ChartsSection'
```

2. Agregar `<ChartsSection>` dentro del `<>` fragment (despuÃ©s del bloque de resumen `</div>` que cierra a lÃ­nea 179, y antes del grid `div className="grid grid-cols-1 lg:grid-cols-2 gap-6"`):

```tsx
            <ChartsSection userId={user!.uid} selectedMonth={selectedMonth} />
```

El resultado: entre el resumen del mes y el grid de Budget/AddPurchase, va la secciÃ³n de grÃ¡ficos colapsable.

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS. Verificar que Recharts estÃ© en un chunk separado (no en el bundle principal).

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat(graficos): integrar ChartsSection en Dashboard (colapsable, debajo del resumen)"
```

---

## Task 7: Tests de integraciÃ³n + smoke test + build + deploy

**Files:**
- Modify: `src/pages/Dashboard.test.tsx` (extender con test de ChartsSection)

- [ ] **Step 1: Add integration test to Dashboard.test.tsx**

Agregar a `src/pages/Dashboard.test.tsx` (dentro del `describe('Dashboard multi-mes', ...)`):

```tsx
vi.mock('@/components/ChartsSection', () => ({
  default: ({ userId, selectedMonth }: { userId: string; selectedMonth: string }) => (
    <div data-testid="charts-section" data-userid={userId} data-month={selectedMonth}>
      Charts Section
    </div>
  ),
}))
```

Agregar test:

```tsx
it('should render ChartsSection with userId and selectedMonth', async () => {
  const { getBudget } = await import('@/services/budget')
  const { getTotalSpent } = await import('@/services/purchases')
  vi.mocked(getBudget).mockResolvedValue({ amount: 50000 } as any)
  vi.mocked(getTotalSpent).mockResolvedValue(30000)

  renderDashboard()

  await waitFor(() => {
    const charts = screen.getByTestId('charts-section')
    expect(charts).toBeInTheDocument()
    expect(charts.getAttribute('data-userid')).toBe('user-1')
    expect(charts.getAttribute('data-month')).toMatch(/^\d{4}-\d{2}$/)
  })
})
```

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: PASS â€” todos los tests.

- [ ] **Step 3: Build de producciÃ³n**

Run: `npm run build`
Expected: PASS.
