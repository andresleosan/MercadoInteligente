# Spec — Fase 4: Historial Multi-Mes

**Fecha:** 2026-07-13
**Proyecto:** Mercado Inteligente (v2)
**Autor:** Cronos (orquestación) + Andrés (aprobación)
**Estado:** Aprobado — listo para plan de implementación

## Contexto

Mercado Inteligente es una PWA de control de gastos de mercado. El MVP v1 y la Fase 2 (OCR por Foto) están desplegados en Cloudflare Pages. Esta es la segunda fase de v2 — permite al usuario navegar entre meses para ver historial de compras, presupuesto y resumen de cualquier mes.

Stack: React 18 + TypeScript + Vite, Firebase (Auth/Firestore/Storage), vite-plugin-pwa, Vitest.

Servicios existentes relevantes:
- `getBudget(userId, month?)` — ya acepta mes opcional (`src/services/budget.ts:22`)
- `getPurchases(userId, month?)` — ya acepta mes opcional (`src/services/purchases.ts:51`)
- `getTotalSpent(userId, month?)` — ya acepta mes opcional (`src/services/purchases.ts:90`)
- `setBudget(userId, amount, month?)` — ya acepta mes opcional

## Objetivo

Permitir al usuario navegar entre meses (pasados y futuros) desde el Dashboard, viendo para cada mes: presupuesto definido, total gastado, restante/pasado, y la lista de compras de ese mes. Si un mes no tiene presupuesto, puede definirlo ahí mismo.

## Decisiones de diseño (aprobadas)

1. **Navegación: flechas ← →.** Botones de mes anterior/siguiente arriba del Dashboard. Label en el centro: "Julio 2026" (mes en español + año).
2. **Sincronizar Dashboard:** las flechas cambian el mes, y TODO el Dashboard (presupuesto, total gastado, barra de progreso, historial) se actualiza al mes seleccionado.
3. **Mes sin presupuesto: mostrar "Sin presupuesto" + botón "Definir presupuesto".** El botón abre el form de Budget con el mes seleccionado. No se heredan presupuestos de otros meses.
4. **Meses futuros permitidos.** Navegación libre en ambas direcciones (pasado y futuro). Sin límite temporal. Meses futuros muestran "Sin compras aún" + opción de pre-definir presupuesto.
5. **Resumen con 3 números clave:** "Gastado" / "Presupuesto" / "Restante" (verde) o "Pasado" (rojo). Barra de progreso con color condicional. Sin barra si no hay presupuesto.
6. **Default: siempre mes actual.** Al abrir la app o recargar, vuelve al mes actual. No se persiste el mes seleccionado.
7. **Navegación totalmente libre.** Flechas siempre habilitadas. Sin límite de meses hacia pasado o futuro.

## Arquitectura

### Nuevos archivos

- `src/components/MonthNavigator.tsx` — flechas ← → + label de mes en español. Props: `month: string` (formato `YYYY-MM`), `onChange: (month: string) => void`. Flechas siempre habilitadas. Maneja cambio de año correctamente (diciembre ← → enero).

### Archivos existentes que se modifican

- `src/pages/Dashboard.tsx` — agrega estado `selectedMonth` (default: mes actual). Agrega `MonthNavigator` arriba. Pasa `selectedMonth` a `getBudget`, `getTotalSpent` y `PurchaseHistory`. Agrega 3 números de resumen (Gastado / Presupuesto / Restante-Pasado). Agrega estado `showBudgetForm` para abrir Budget cuando no hay presupuesto. Agrega carga independiente (presupuesto, total, compras) con manejo de errores por componente.
- `src/pages/PurchaseHistory.tsx` — acepta prop `month` y la pasa a `getPurchases`. Si no hay compras, muestra "Sin compras en este mes".
- `src/pages/Budget.tsx` — acepta props `month?: string` (default: mes actual) y `onSaved?: () => void` (callback después de guardar). Usa `month` para `getBudget`/`setBudget` en vez del mes actual hardcodeado.

### Sin cambios

- `src/services/budget.ts` — `getBudget` y `setBudget` ya aceptan `month`.
- `src/services/purchases.ts` — `getPurchases` y `getTotalSpent` ya aceptan `month`.
- Firestore — el esquema ya soporta cualquier mes (`users/{uid}/budgets/{month}`).

## Flujo de uso

1. **Dashboard** abre en mes actual (ej: Julio 2026).
2. `MonthNavigator` muestra "← Julio 2026 →" arriba.
3. Usuario tap "←" → `selectedMonth` = "2026-06".
4. Dashboard carga en paralelo:
   - `getBudget(uid, "2026-06")` → presupuesto de junio
   - `getTotalSpent(uid, "2026-06")` → total gastado en junio
   - `getPurchases(uid, "2026-06")` → lista de compras de junio
5. Resumen muestra los 3 números + barra de progreso.
6. `PurchaseHistory` muestra las compras de junio.

### Caso: mes sin presupuesto

- `getBudget` retorna `null`
- Resumen muestra: "Gastado: $X" / "Sin presupuesto" / botón "Definir presupuesto"
- Botón abre `Budget` con `month` = mes seleccionado
- Usuario define presupuesto → `onSaved` → vuelve al Dashboard del mes seleccionado con el presupuesto cargado

### Caso: mes futuro

- Flecha → siempre habilitada
- `getPurchases` retorna `[]` → "Sin compras aún"
- `getBudget` retorna `null` → botón "Definir presupuesto" (caso útil: pre-setear agosto)
- `getTotalSpent` retorna `0`

### Caso: mes pasado con presupuesto y compras

- Resumen: "Gastado: $80.000" / "Presupuesto: $50.000" / "Pasado: $30.000" (rojo)
- Barra de progreso roja, fill cap a 100%
- PurchaseHistory: lista de compras de ese mes

## Componente MonthNavigator

```
┌──────────────────────────────────────┐
│   ←        Julio 2026         →       │
│  (siempre                        (siempre
│   habilitada)                     habilitada)
└──────────────────────────────────────┘
```

- Label: `{Mes en español} {Año}` — ej: "Julio 2026", "Enero 2027".
- Array de meses: `['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']`.
- Props: `month: string` (formato `YYYY-MM`), `onChange: (month: string) => void`.
- Al tap ←: resta 1 mes. Al tap →: suma 1 mes. Maneja cambio de año (enero ← resta a diciembre del año anterior; diciembre → suma a enero del año siguiente).

## Resumen del mes (3 estados)

| Estado | Condición | UI |
|---|---|---|
| **Normal** | gastado ≤ presupuesto | "Gastado: $X" / "Presupuesto: $Y" / "Restante: $Z" en verde. Barra de progreso verde, fill = `gastado/presupuesto`. |
| **Pasado** | gastado > presupuesto | "Gastado: $X" / "Presupuesto: $Y" / "Pasado: $Z" en rojo. Barra de progreso roja, fill cap a 100%. |
| **Sin presupuesto** | `getBudget` retorna `null` | "Gastado: $X" / "Sin presupuesto" / botón "Definir presupuesto". Sin barra de progreso. |

Barra de progreso: reutiliza el componente existente en `Dashboard.tsx`. Se le agrega color condicional (verde/rojo) y se oculta si no hay presupuesto.

## Cambios en Budget.tsx

Props nuevas:
```ts
interface BudgetProps {
  month?: string  // default: mes actual (YYYY-MM)
  onSaved?: () => void  // callback después de guardar
}
```

- Si `month` se pasa, usa ese mes para `getBudget`/`setBudget`.
- Si no se pasa, usa mes actual (comportamiento actual, sin romper).
- Si `onSaved` se pasa, lo llama después de guardar.
- Integración en Dashboard: estado `showBudgetForm`. Si `showBudgetForm && !budget`, renderiza `<Budget month={selectedMonth} onSaved={...} />`.

## Manejo de errores

| Escenario | Acción |
|---|---|
| Firestore falla al cargar presupuesto | "Error al cargar presupuesto" + botón "Reintentar". No bloquea la lista de compras. |
| Firestore falla al cargar compras | "Error al cargar compras" + botón "Reintentar". No bloquea el resumen. |
| Firestore falla al cargar total gastado | Tratar total como 0. "Error al calcular total" discreto. No bloquea presupuesto ni compras. |
| Firestore falla al guardar presupuesto | "Error al guardar presupuesto. Intentá de nuevo." (ya existe). |
| Usuario navega rápido entre meses | Cancelar queries pendientes con flag `isMounted` o cleanup de `useEffect` para no setear estado de un mes viejo sobre el nuevo. |

**Principio:** presupuesto, total y compras cargan independientemente — un fallo en uno no bloquea los otros.

## Testing

| Nivel | Qué cubre | Herramienta |
|---|---|---|
| Unit — `MonthNavigator` | Render del label en español, flecha ← resta mes, flecha → suma mes, cambio de año (dic → ene), onChange llamado con formato `YYYY-MM`. | Vitest + Testing Library |
| Component — Dashboard multi-mes | Mes actual por defecto, navegación cambia `selectedMonth`, servicios llamados con mes correcto. | Vitest + Testing Library + vi.mock |
| Component — Resumen | 3 estados: normal (restante verde), pasado (rojo), sin presupuesto (botón definir). | Vitest + Testing Library |
| Component — Budget con month prop | Budget carga mes específico, guarda con mes correcto, llama `onSaved`. | Vitest + Testing Library |
| Component — PurchaseHistory mes vacío | Lista vacía muestra "Sin compras en este mes". | Vitest + Testing Library |
| Integración — navegación sin presupuesto | Navegar a mes sin presupuesto → botón "Definir" → Budget form → guardar → vuelve al Dashboard con presupuesto. | Vitest + Testing Library (mock servicios) |

**No se prueba:** navegación infinita al futuro (no aporta valor probar más allá del cambio de año).

## Fuera de alcance (v2)

- Persistir mes seleccionado entre sesiones (localStorage).
- Comparación entre meses ("gastaste 15% más que en junio") — eso va en la Fase 3 (Dashboard con Gráficos).
- Filtros por categoría dentro del historial.
- Búsqueda de compras por nombre dentro del historial.
- Exportar historial a CSV/PDF (roadmap v3).
