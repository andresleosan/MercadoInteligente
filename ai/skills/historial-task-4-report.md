# Task 4 Report — Modificar Dashboard.tsx (integrar MonthNavigator, selectedMonth, resumen 3 estados, botón definir presupuesto)

## What I implemented

Reemplacé `src/pages/Dashboard.tsx` con la versión multi-mes del plan Fase 4. El Dashboard ahora:

- **`selectedMonth` state** con default `getCurrentMonth()` (`YYYY-MM` del mes actual).
- **`MonthNavigator`** en la parte superior de `<main>`, vinculado a `selectedMonth`/`setSelectedMonth`.
- **`budget` como `number | null`** (antes `budgetAmount: number`), distinguindo "sin presupuesto" de "presupuesto 0".
- **`useEffect` con `isMounted`** flag y deps `[user, selectedMonth]`: recarga al cambiar de mes, resetea `loading`/`error`, y cancela queries stale (no hace `setState` si `!isMounted`). Cleanup pone `isMounted = false`.
- **`getBudget(user.uid, selectedMonth)` y `getTotalSpent(user.uid, selectedMonth)`** — ambas reciben el mes seleccionado.
- **Resumen 3 estados** (grid de 3 columnas):
  1. Normal (`budget !== null && !isOverBudget`): Gastado / Presupuesto / **Restante** (verde).
  2. Pasado (`budget !== null && totalSpent > budget`): Gastado / Presupuesto / **Pasado** (rojo, `Math.abs(remaining)`).
  3. Sin presupuesto (`budget === null`): Gastado + bloque `col-span-2` con "Sin presupuesto" y botón **"Definir presupuesto"**.
- **`showBudgetForm`** state: al hacer clic en "Definir presupuesto" renderiza `<BudgetPage month={selectedMonth} onSaved={() => setShowBudgetForm(false)} />` en lugar del Dashboard (el `onSaved` vuelve al Dashboard, lo que dispara recarga del resumen).
- **Barra de progreso** con color condicional (verde ≤80%, amarillo >80%, rojo >100%) — solo se renderiza si `budget !== null && budget > 0`.
- **`BudgetPage` y `PurchaseHistory` en la grid** ahora reciben `month={selectedMonth}`.
- Preservados: `usePWAInstall` (botón "Instalar app") y `handleLogout`.
- Eliminado `{user?.uid}` del header (debug innecesario) y comentario suelto.

## Files changed

- `src/pages/Dashboard.tsx` (modificado, +76/-37)

## Typecheck and build results

- `npx tsc -b --noEmit` → **PASS** (exit 0)
- `npm run build` → **PASS** (exit 0, `tsc -b && vite build`, 100 módulos, built in 1m 7s). Warning habitual de chunk > 500 kB (Tesseract.js lazy-load, ya conocido en fases previas).

## Self-review findings

Checklist de completitud — todo presente:

- [x] MonthNavigator importado y renderizado arriba de main
- [x] `selectedMonth` state con default `getCurrentMonth`
- [x] `budget: number | null` (distinción sin-presupuesto)
- [x] `showBudgetForm` state con toggle al standalone BudgetPage
- [x] `isMounted` flag en useEffect con cleanup
- [x] `getBudget`/`getTotalSpent` llamados con `selectedMonth`
- [x] 3 estados del resumen: normal (restante verde), pasado (rojo), sin presupuesto (botón definir)
- [x] Barra de progreso con color condicional green/yellow/red
- [x] `<BudgetPage month={selectedMonth} />` y `<PurchaseHistory month={selectedMonth} />` en grid
- [x] `usePWAInstall` y `handleLogout` preservados
- [x] Typecheck PASS
- [x] Build PASS

Verificación de firmas de dependencias (Tasks 1-3) contra el uso en Dashboard:
- `getBudget(userId: string, month?: string): Promise<Budget | null>` ✓ (`budget.ts:19`)
- `getTotalSpent(userId: string, month?: string): Promise<number>` ✓ (`purchases.ts:90`)
- `MonthNavigator { month: string; onChange: (month: string) => void }` ✓ — `setSelectedMonth` compatible con `(month: string) => void`
- `BudgetPage { month?: string; onSaved?: () => void }` ✓
- `PurchaseHistory { month?: string }` ✓

## Concerns

- **Brief truncado**: `historial-task-4-brief.md` terminaba en la línea 157 a mitad del code block (en `const [showBudgetForm, setShowBudgetForm] = useState(false)`), sin incluir el `useEffect`, `handleLogout`, ni el JSX. La continuación del código estaba al inicio de `historial-task-5-brief.md`. Para obtener el código autoritativo y completo leí directamente el plan `docs/superpowers/plans/2026-07-13-historial-multi-mes.md` (líneas 528-718). No impactó el resultado, pero vale la pena corregir la generación de briefs para que cada brief sea autocontenido.
- **UX redundante menor (preexistente en el plan)**: cuando `budget === null` y `!showBudgetForm`, el usuario ve tanto el botón "Definir presupuesto" (que abre el BudgetPage standalone) como el `<BudgetPage month={selectedMonth} />` inline en la grid de abajo. Es lo que el plan especifica textualmente, así que lo respeté; no es un defecto de esta implementación. Si se quisiera evitar la duplicación, la grid podría ocultar BudgetPage cuando `budget === null`, pero eso sería una decisión de producto fuera del alcance de Task 4.
- Sin otros concerns. El commit incluye únicamente `src/pages/Dashboard.tsx` (no se tocaron el spec modificado ni `.superpowers/` sin trackear).

---

## Code-review fix — Gastado usa color neutral (no rojo)

**Fecha:** 2026-07-13
**Issue:** `src/pages/Dashboard.tsx:133` — el monto "Gastado" usaba `text-red-600`, pero por convención global del proyecto el rojo es para "pasado" (sobre presupuesto), no para el monto gastado en sí (un valor neutral de resumen).
**Fix:** Cambio de clase `text-red-600` → `text-gray-900` en el `<p>` del valor "Gastado" (mismo color neutral que el valor "Presupuesto").

### Files changed

- `src/pages/Dashboard.tsx` (1 línea: `text-red-600` → `text-gray-900` en el párrafo del monto Gastado)

### Diff

```diff
-                  <p className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</p>
+                  <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
```

### Verification

- `npx tsc -b --noEmit` → **PASS** (exit 0). Sin cambios en tipos; edición puramente cosmética de clase CSS.
- Verificado que "Pasado/Restante" (línea 143) sigue usando `text-red-600`/`text-green-600` condicionalmente — la semántica de rojo = pasado se preserva intacta.

### Commit

- SHA: `3dabe2ec22bad51b5e32745b324977916257875c`
- Subject: `fix(historial): Gastado usa color neutral, no rojo (rojo es para pasado)`
- Scope del commit: solo `src/pages/Dashboard.tsx` (1 file changed, 1 insertion, 1 deletion). La modificación preexistente a `docs/superpowers/specs/2026-07-13-ocr-por-foto-design.md` quedó fuera del commit.
