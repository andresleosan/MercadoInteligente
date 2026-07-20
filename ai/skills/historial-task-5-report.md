# Task 5 Report — Tests de integración del Dashboard multi-mes

## What I implemented

Creé `src/pages/Dashboard.test.tsx` con 7 tests de integración que cubren el comportamiento multi-mes del Dashboard. Los tests mockean todos los servicios Firebase (`getBudget`, `getTotalSpent`, `getPurchases`, `logout`) y los componentes hijos (`BudgetPage`, `AddPurchase`, `PurchaseHistory`), dejando `MonthNavigator` real para verificar el label del mes.

Tests (7):
1. **should show current month label on load** — verifica que el `MonthNavigator` real renderiza el label del mes actual en español (ej: "Julio 2026").
2. **should show resumen with presupuesto and restante when budget exists** — estado normal: Gastado/Presupuesto/Restante (verde) + `$20.000` (budget 50000, spent 30000).
3. **should show Pasado in red when spent > budget** — estado pasado: label "Pasado" + `$30.000` (budget 50000, spent 80000, |remaining| = 30000).
4. **should show Sin presupuesto and Definir button when budget is null** — estado sin presupuesto: "Sin presupuesto" + botón "Definir presupuesto".
5. **should open Budget form when Definir presupuesto clicked** — toggle del `showBudgetForm`.
6. **should call services with selectedMonth when navigating** — click en "mes anterior" dispara `getBudget`/`getTotalSpent` con el nuevo mes.
7. **should pass month to PurchaseHistory** — el `PurchaseHistory` mock recibe `month` y se renderiza.

## Test results

- **Focused:** `npx vitest run src/pages/Dashboard.test.tsx` → **7/7 PASS**.
- **Full suite:** `npx vitest run` → **71/71 PASS** (13 archivos).
- **Typecheck:** `npx tsc -b --noEmit` → **PASS** (exit 0). Los archivos `.test.tsx` están excluidos del `tsconfig.json` (`exclude: ["src/**/*.test.tsx"]`), así que el typecheck no valida el test pero la app sigue compilando limpia.

## Adjustments made to the brief's test code

El brief autoritativo se obtuvo del plan `docs/superpowers/plans/2026-07-13-historial-multi-mes.md` (líneas 763-923), ya que `historial-task-5-brief.md` estaba truncado/mal alineado (contenía el final del código de Task 4, no el código de test de Task 5 — mismo problema ya reportado en Task 4).

Dos ajustes al código del brief:

### 1. Mock de `useAuth` con referencia estable (fix de flakiness)

**Brief:**
```tsx
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user-1', email: 'test@test.com' } }),
}))
```
**Ajustado a:**
```tsx
vi.mock('@/hooks/useAuth', () => {
  const user = { uid: 'user-1', email: 'test@test.com' }
  return { useAuth: () => ({ user }) }
})
```

**Motivo:** El mock del brief crea un **nuevo objeto `user` en cada render**. El `useEffect` del Dashboard tiene deps `[user, selectedMonth]`, así que con una referencia nueva de `user` en cada render, el efecto se re-disparaba continuamente → `setLoading(true)` → oscilación indefinida del estado `loading`. En la corrida aislada del archivo, los `waitFor` alcanzaban la ventana donde `loading=false` y los 7 tests pasaban. En la corrida del **suite completo** (más lento por overhead), el test del toggle fallaba: el `waitFor` del botón "Definir presupuesto" alcanzaba la ventana correcta, pero la aserción sincrónica inmediatamente después capturaba un momento donde `loading` había vuelto a `true` (spinner visible, "Resumen del mes" ausente). Con la referencia estable (`user` creado una sola vez dentro de la factory closure), el `useEffect` no se re-dispara y `loading` se mantiene estable. Fix de causa raíz que también hace más robusto el test original del brief.

### 2. Test del toggle fortalecido (verificación real del `showBudgetForm`)

**Brief** (test 5, después del click):
```tsx
await waitFor(() => {
  expect(screen.getByTestId('budget-form')).toBeInTheDocument()
})
```
**Ajustado a:**
```tsx
expect(screen.getByText('Resumen del mes')).toBeInTheDocument()

fireEvent.click(screen.getByRole('button', { name: /definir presupuesto/i }))

await waitFor(() => {
  expect(screen.getByTestId('budget-form')).toBeInTheDocument()
  expect(screen.queryByText('Resumen del mes')).not.toBeInTheDocument()
})
```

**Motivo:** El mock de `BudgetPage` es un único componente (`() => <div data-testid="budget-form">…</div>`) usado tanto para el `<BudgetPage month={selectedMonth} />` inline en la grid como para el `<BudgetPage month={selectedMonth} onSaved={…} />` standalone. Cuando `budget === null` y `!showBudgetForm`, la grid renderiza el `BudgetPage` mock → el testid `budget-form` **ya está en el documento antes de hacer click**. Por lo tanto, la aserción del brief pasaba trivialmente sin probar el toggle. Agregué: (a) verificar que "Resumen del mes" está presente **antes** del click (confirmar que el Dashboard normal se muestra), y (b) verificar que "Resumen del mes" **no** está presente **después** del click (confirmar que el `showBudgetForm=true` reemplazó el contenido del Dashboard por el formulario standalone). Junto con `budget-form` presente después, esto prueba efectivamente el toggle.

## Self-review findings

- [x] **7 tests pasan:** 7/7 focused, 71/71 suite completo.
- [x] **3 estados del resumen testeados:**
  - Normal (Restante verde): test 2 ✓
  - Pasado (rojo): test 3 ✓
  - Sin presupuesto (botón definir): test 4 ✓
- [x] **Navegación testada:** test 6 — click "mes anterior" dispara `getBudget`/`getTotalSpent` con `('user-1', <mes>)` ✓
- [x] **Toggle del Budget form testeado:** test 5 — fortalecido con aserciones de presencia/ausencia de "Resumen del mes" antes/después del click ✓
- [x] **Label del mes actual testado:** test 1 — `MonthNavigator` real renderiza "Julio 2026" ✓
- [x] **Month pasado a PurchaseHistory:** test 7 — el mock se renderiza con testid `purchase-history` ✓ (ver concern menor abajo)
- [x] **Commit:** `c0ee895`, scope limitado a `src/pages/Dashboard.test.tsx` (1 file, +164). El `docs/...ocr-por-foto-design.md` modificado y `.superpowers/` sin trackear quedaron fuera del commit.

## Concerns

1. **Test 7 débil (preexistente en el brief):** "should pass month to PurchaseHistory" solo asserts que el testid `purchase-history` está presente — **no verifica el valor del mes**. El mock renderiza `History for {month}` pero el test no aserta el contenido. Para ser fiel al brief lo dejé as-is, pero no prueba realmente que `month` se pase. Se podría fortalecer con `expect(screen.getByText(`History for ${currentMonth}`)).toBeInTheDocument()`.

2. **Dependencia de locale en `toLocaleString()`:** Las aserciones `$20.000`/`$30.000` asumen separador de miles con punto (locale español). El Dashboard usa `${value.toLocaleString()}` sin locale explícito. En este entorno (Node resolvea `es-CO`) produce "20.000" y los tests pasan. En un runner CI con locale `en-US` produciría "20,000" y los tests fallarían. Es una fragilidad preexistente del brief, no una regresión — pero vale para portabilidad de CI. Una fix sería usar `toLocaleString('es-AR')` en el Dashboard o asertar con regex `/20[.,]000/`.

3. **Brief truncado (recurrente):** `historial-task-5-brief.md` no contenía el código de test de Task 5 sino el final del código de Task 4. Recuperé el código autoritativo del plan. Mismo issue ya documentado en el reporte de Task 4.

4. **Sin otros concerns.** Los 7 tests pasan consistentemente (verificado en suite completo tras el fix de flakiness). Sin warnings de `act(...)` en los tests de Dashboard (los warnings de `act` y stderr provienen de otros test files preexistentes — `OCRReview`, `useOCR`, `auth` — y son esperados por sus propios reports).

## Commits

- `c0ee895` — `test(historial): tests de integracion del Dashboard multi-mes` (1 file changed, +164, solo `src/pages/Dashboard.test.tsx`)
