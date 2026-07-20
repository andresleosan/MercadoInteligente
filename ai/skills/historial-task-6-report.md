# Historial Task 6 - Report

## Status: DONE

## Commit
- SHA: `8afc616`
- Subject: `fix(historial): onSaved dispara reload del Dashboard + integration test`
- Branch: `feat/historial-multi-mes`

## Issue 1 (Critical): onSaved no refrescaba el estado del Dashboard

### Problema
En `src/pages/Dashboard.tsx`, al guardar un presupuesto via el formulario "Definir presupuesto", el callback `onSaved` solo llamaba `setShowBudgetForm(false)` — no disparaba una recarga de datos. Las dependencias del useEffect eran `[user, selectedMonth]`, y ninguna cambia al guardar. Resultado: el resumen seguía mostrando "Sin presupuesto" después de guardar, mientras que el `BudgetPage` del grid mostraba el monto guardado — estado contradictorio.

Adicionalmente, el `BudgetPage` del grid (`<BudgetPage month={selectedMonth} />`) no tenía prop `onSaved` — guardar ahí tampoco refrescaba el resumen.

### Fix aplicado
- Se agregó estado `budgetVersion` (number, inicia en 0) en `src/pages/Dashboard.tsx:27`.
- El `onSaved` del formulario `BudgetPage` ahora además llama `setBudgetVersion(v => v + 1)` (`src/pages/Dashboard.tsx:124`).
- Se agregó `budgetVersion` a las dependencias del useEffect: `[user, selectedMonth, budgetVersion]` (`src/pages/Dashboard.tsx:65`).
- Se agregó `onSaved={() => setBudgetVersion(v => v + 1)}` al `BudgetPage` del grid (`src/pages/Dashboard.tsx:182-185`).

Esto fuerza una recarga de datos (`getBudget` + `getTotalSpent`) cada vez que se guarda un presupuesto, desde cualquiera de los dos puntos de entrada.

## Issue 2 (Important): Integration test faltante

### Problema
La spec requería un test de integración: "navegar a mes sin presupuesto → botón Definir → Budget form → guardar → vuelve al Dashboard con presupuesto cargado". Este test faltaba y habría detectado Issue 1.

### Fix aplicado
Se actualizó el mock de `BudgetPage` en `src/pages/Dashboard.test.tsx` para aceptar `onSaved` y exponer un botón con `data-testid="budget-save-button"` que lo invoca, de modo que se pueda simular el guardado sin traer la implementación real.

Se agregó el test `should reload budget and show it in summary after saving via Budget form` que:
1. Mocks `getBudget` para retornar `null` en la primera llamada y `{ amount: 50000 }` en la segunda (`mockResolvedValueOnce` encadenado).
2. Mocks `getTotalSpent` para retornar `10000`.
3. Renderiza el Dashboard y espera que aparezca "Sin presupuesto".
4. Hace clic en "Definir presupuesto" y verifica que aparece el formulario (mock `budget-form`).
5. Hace clic en el botón de guardado del mock (`budget-save-button`), invocando `onSaved`.
6. Verifica que desaparece "Sin presupuesto", aparece "Restante" y el monto `$40.000` (restante = 50000 - 10000).
7. Verifica que `getBudget` fue llamado exactamente 2 veces (carga inicial + recarga post-save).

## Verificación

### Tests
Comando: `npx vitest run src/pages/Dashboard.test.tsx`
Resultado: **8/8 passing** (7 existentes + 1 nuevo)

```
 ✓ Dashboard multi-mes > should show current month label on load
 ✓ Dashboard multi-mes > should show Sin presupuesto and Definir button when budget is null
 ✓ Dashboard multi-mes > should open Budget form when Definir presupuesto clicked
 ✓ Dashboard multi-mes > should call services with selectedMonth when navigating
 ✓ Dashboard multi-mes > should reload budget and show it in summary after saving via Budget form

 Test Files  1 passed (1)
      Tests  8 passed (8)
```

### Typecheck
Comando: `npx tsc -b --noEmit`
Resultado: **PASS** (sin output, sin errores)

## Archivos modificados
- `src/pages/Dashboard.tsx` (+7/-2): estado `budgetVersion`, deps del useEffect, `onSaved` en ambos `BudgetPage`.
- `src/pages/Dashboard.test.tsx` (+41/-1): mock de `BudgetPage` con botón de guardado, nuevo test de integración.

## Report file path
`S:\Respaldo\Los Titanes\agencia-los-titanes\mercado-inteligente\.superpowers\sdd\historial-task-6-report.md`
