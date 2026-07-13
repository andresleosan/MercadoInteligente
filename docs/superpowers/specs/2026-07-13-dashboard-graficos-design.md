# Spec — Fase 3: Dashboard con Gráficos

**Fecha:** 2026-07-13
**Proyecto:** Mercado Inteligente (v2)
**Autor:** Cronos (orquestación) + Andrés (aprobación)
**Estado:** Aprobado — listo para plan de implementación

## Contexto

Mercado Inteligente es una PWA de control de gastos de mercado. El MVP v1, Fase 2 (OCR por Foto) y Fase 4 (Historial Multi-Mes) están desplegados en Cloudflare Pages. Esta es la tercera fase de v2 — agrega gráficos visuales al Dashboard usando Recharts.

Stack: React 18 + TypeScript + Vite, Firebase (Auth/Firestore/Storage), vite-plugin-pwa, Vitest. Servicios existentes: `getBudget(uid, month?)`, `getPurchases(uid, month?)`, `getTotalSpent(uid, month?)`.

## Objetivo

Agregar 3 gráficos al Dashboard: barras (gastado vs presupuesto por mes, 6 meses), top 5 productos del mes seleccionado, y línea de tendencia (6 meses). Los gráficos están colapsados por default y se cargan con lazy-load (Recharts no va al bundle inicial).

## Decisiones de diseño (aprobadas)

1. **Sin categorías (pie chart reemplazado).** El modelo de datos no tiene categorías. El pie chart de "gastos por categoría" se reemplaza por "top 5 productos más comprados del mes seleccionado". Las categorías van en v3.
2. **3 gráficos:**
   - Barras: gastado vs presupuesto de los últimos 6 meses hasta el mes seleccionado (ComposedChart con Bar + Line).
   - Top 5 productos: barras horizontales de los productos más comprados del mes seleccionado.
   - Línea: tendencia de gasto total de los últimos 6 meses hasta el mes seleccionado.
3. **Colapsable + lazy-load.** Botón "Ver gráficos" (default contraído). Al expandir, `React.lazy` carga `ChartsContent` con Recharts en un chunk separado (~95KB gzip, 0KB en bundle inicial).
4. **Una sola query para 6 meses.** Nuevo servicio `getTotalSpentByMonth(uid, monthsBack, referenceMonth)` — 1 query de Firestore con `where('createdAt', '>=', startDate)`, agregación por mes en el cliente.
5. **Barras con línea de presupuesto.** `ComposedChart` con `Bar` (gastado, color condicional verde/rojo) + `Line` (presupuesto). Meses sin presupuesto: la línea no tiene punto para ese mes (gap).
6. **6 meses hasta el mes seleccionado.** Si el usuario navegó a marzo 2026, los gráficos muestran Oct 2025 - Mar 2026. Coherente con la Fase 4.
7. **Top 5 productos del mes seleccionado.** Agrupación por `item.name` (case-insensitive, trimmed), orden por `totalSpent` descendente, limit 5. Si hay <5 productos, se muestran los que haya.
8. **Período dinámico.** Los gráficos se actualizan al navegar meses (Fase 4). Una vez expandidos, quedan visibles durante la sesión.

## Arquitectura

### Nuevos archivos

- `src/components/ChartsSection.tsx` — sección colapsable. Estado `expanded` (default: false). Botón "Ver gráficos" / "Ocultar gráficos". `React.lazy(() => import('./ChartsContent'))` + `<Suspense fallback={spinner}>`.
- `src/components/ChartsContent.tsx` — contenido real con los 3 gráficos Recharts. Carga datos via `getTotalSpentByMonth` y `getTopProducts`. Maneja estados: loading, error, empty. Recibe `userId` y `selectedMonth` como props.
- `src/services/analytics.ts` — `getTotalSpentByMonth(userId, monthsBack, referenceMonth)` → `MonthData[]`. `getTopProducts(userId, month, limit)` → `ProductData[]`.
- `src/services/analytics.test.ts` — tests de los servicios con mocks.

### Archivos existentes que se modifican

- `src/pages/Dashboard.tsx` — agrega `<ChartsSection userId={user.uid} selectedMonth={selectedMonth} />` debajo del resumen, arriba del grid presupuesto/compra.
- `src/services/budget.ts` — agrega `getBudgetsByMonthRange(userId, monthsBack, referenceMonth)` → `Budget[]` (para la línea de presupuesto en las barras).
- `src/services/purchases.ts` — agrega `getPurchasesByDateRange(userId, startDate, endDate)` para que analytics pueda consultar 6 meses de compras en una sola query.

### Instalación

- `npm install recharts` — va al bundle lazy (importado dinámicamente en `ChartsContent`), no al inicial.

### Tipos nuevos

```ts
interface MonthData {
  month: string        // "YYYY-MM"
  spent: number        // total gastado ese mes
  budget: number | null // presupuesto de ese mes (null si no tiene)
}

interface ProductData {
  name: string         // nombre del producto (normalizado)
  totalSpent: number   // suma de totalPrice de todas las compras de ese producto
  count: number        // cantidad de compras que incluyen ese producto
}
```

## Servicios de analytics

### `getTotalSpentByMonth(userId, monthsBack, referenceMonth)`

1. Calcular `startDate` = primer día del mes más viejo (`referenceMonth - monthsBack + 1`).
2. Calcular `endDate` = último día de `referenceMonth`.
3. Una sola query Firestore: `where('createdAt', '>=', startDate)` + `where('createdAt', '<=', endDate)`.
4. Agrupar resultados por mes en el cliente: sumar `total` de cada compra por mes.
5. Cargar presupuestos de los 6 meses (`getBudgetsByMonthRange`).
6. Retornar array de `monthsBack` `{ month, spent, budget }` ordenado cronológicamente.
7. Si un mes no tiene compras, `spent = 0`. Si no tiene presupuesto, `budget = null`.

### `getTopProducts(userId, month, limit)`

1. Calcular `startDate`/`endDate` del `month` dado.
2. Query de compras de ese mes (reutiliza `getPurchases(uid, month)` o `getPurchasesByDateRange`).
3. Iterar `purchase.items` y agrupar por `item.name` (case-insensitive, trimmed).
4. Por cada nombre: sumar `totalPrice` y contar apariciones.
5. Ordenar por `totalSpent` descendente.
6. Retornar top `limit` (default 5).

### `getBudgetsByMonthRange(userId, monthsBack, referenceMonth)`

1. Calcular los `monthsBack` meses hasta `referenceMonth`.
2. Llamar `getBudget(uid, month)` para cada mes en paralelo con `Promise.all`.
3. Filtrar `null` (meses sin presupuesto).
4. Retornar `Budget[]`.

## Gráficos — especificación visual

### 1. Barras — Gastado vs Presupuesto (6 meses hasta el seleccionado)

- `ComposedChart` de Recharts con `Bar` (gastado) + `Line` (presupuesto).
- Color barras: `green-600` si gastado ≤ presupuesto, `red-600` si gastado > presupuesto.
- Línea de presupuesto: color `gray-600`, sin punto para meses sin presupuesto (gap).
- Eje X: nombres de mes abreviados en español (Feb, Mar, Abr, May, Jun, Jul).
- Eje Y: valores en pesos ($).
- Tooltip al hover mostrando mes, gastado, presupuesto.

### 2. Top 5 productos (mes seleccionado)

- `BarChart` horizontal (`layout="vertical"`).
- Color: `green-600` uniforme.
- Eje Y: nombres de productos.
- Eje X: valores en pesos ($).
- Si hay <5 productos, se muestran los que haya.
- Título: "Top 5 productos — {Mes} {Año}".

### 3. Línea — Tendencia de gastos (6 meses hasta el seleccionado)

- `LineChart` con `Line dataKey="spent"`.
- Color: `green-600`.
- Puntos marcados en cada mes.
- Eje X: nombres de mes abreviados.
- Eje Y: valores en pesos ($).
- Muestra la dirección del gasto.

## ChartsSection — colapsable y lazy-load

- Default: contraído. Botón "📊 Ver gráficos".
- Al expandir: `React.lazy(() => import('./ChartsContent'))` carga el componente con Recharts.
- `<Suspense fallback={spinner}>` muestra spinner mientras carga (~1s primera vez).
- Una vez expandido, queda expandido durante la sesión. Al navecar meses, `ChartsContent` recibe el nuevo `selectedMonth` y recarga datos.
- Botón cambia a "📊 Ocultar gráficos" para contraer.

## Manejo de errores

| Escenario | Acción |
|---|---|
| Firestore falla al cargar compras (6 meses) | "Error al cargar gráficos" + botón "Reintentar". Gráficos vacíos. |
| Firestore falla al cargar presupuestos (6 meses) | Barras muestran solo gastado, sin línea de presupuesto. Línea de tendencia funciona. No bloqueante. |
| Firestore falla al cargar top productos | "Error al cargar top productos" en esa sección. Los otros 2 gráficos siguen funcionando. |
| Mes seleccionado sin compras | Barras: barra del mes en 0. Top productos: "Sin compras en este mes". Línea: punto en 0. |
| Menos de 6 meses de historial | Barras/línea muestran los meses que haya. No se inventan meses vacíos antes del primer uso. |
| Recharts no carga (chunk falla) | "Error al cargar gráficos. Recargá la página." |

**Principio:** los 3 gráficos cargan independientemente — un fallo en uno no bloquea los otros. Presupuesto faltante no es error.

## Testing

| Nivel | Qué cubre | Herramienta |
|---|---|---|
| Unit — `analytics.ts` | `getTotalSpentByMonth`: agrupación por mes, 6 puntos, presupuesto null. `getTopProducts`: agrupación case-insensitive, orden descendente, limit 5. | Vitest + vi.mock |
| Unit — `getBudgetsByMonthRange` | Retorna presupuestos de 6 meses, mes sin presupuesto excluido. | Vitest + vi.mock |
| Component — `ChartsSection` | Contraído por default, botón expande, botón contrae, Suspense fallback. | Vitest + Testing Library |
| Component — `ChartsContent` | Render de 3 gráficos, datos pasados a Recharts, estados vacíos, error con Reintentar. Recharts mockeado. | Vitest + Testing Library + vi.mock('recharts') |
| Integración — Dashboard | `ChartsSection` presente, recibe `selectedMonth`, se actualiza al navegar. | Vitest + Testing Library (extender Dashboard.test.tsx) |

**No se prueba:** render visual real de Recharts (canvas/DOM, flaky en jsdom). Se prueba que los datos correctos se pasan a Recharts.

## Fuera de alcance (v2)

- Categorización automática de productos (roadmap v3).
- Filtros por categoría en gráficos.
- Exportar gráficos como imagen.
- Gráficos interactivos con drill-down (click en barra → ver compras de ese mes).
- Comparación de períodos arbitrarios (ej: este trimestre vs trimestre anterior).
