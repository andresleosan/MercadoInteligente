# PLAN DE IMPLEMENTACIÓN — Mercado Inteligente

**Fecha:** 2026-07-16
**Autor:** Cronos (Agencia Los Titanes)
**Estado:** PROPUESTA — Pendiente de aprobación

---

## Estructura del plan

7 fases secuenciales. Cada fase es un milestone independiente que puede desplegarse sin romper la funcionalidad anterior.

**Principio rector:** Cada fase deja la app en un estado funcional. Nunca se despliega algo que rompa el flujo del usuario.

---

## FASE 1 — Modelo de datos

**Objetivo:** Definir tipos, servicios y reglas de Firestore para las nuevas entidades.

**Riesgo:** BAJO — Solo se crea código nuevo, no se modifica existente.

### Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/types/index.ts` | Agregar tipos `Store`, `DailyBudget`, `StoreBudget`; modificar `Purchase` |
| `src/services/stores.ts` | CRUD de establecimientos |
| `src/services/dailyBudget.ts` | CRUD de presupuesto diario global |
| `src/services/storeBudget.ts` | CRUD de presupuesto diario por store |
| `src/utils/date.ts` | Agregar `getCurrentDate()`, `formatDate()`, `getDateRange()` |
| `firestore.rules` | Agregar reglas para `stores`, `dailyBudgets`, `storeBudgets` |
| `firestore.indexes.json` | Agregar índices compuestos para queries por store + fecha |

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/types/index.ts` | Agregar campos `storeId`, `storeName`, `purchaseDate` a `Purchase` |
| `src/services/purchases.ts` | Modificar `addPurchase()` para aceptar nuevos campos; agregar fallback para datos legacy |

### Dependencias

Ninguna. Esta fase es la base para todas las demás.

### Pruebas necesarias

| Prueba | Criterio de aceptación |
|--------|----------------------|
| `stores.test.ts` | CRUD completo: crear, leer, actualizar, eliminar store |
| `dailyBudget.test.ts` | CRUD completo: crear, leer, actualizar budget diario |
| `storeBudget.test.ts` | CRUD completo: crear, leer, actualizar budget por store |
| `purchases.test.ts` | `addPurchase()` con storeId/storeName/purchaseDate funciona |
| `purchases.test.ts` | `getPurchases()` funciona con compras legacy (sin storeId) |
| Firestore rules | Un usuario no puede leer/escribir stores de otro usuario |

### Verificación

```bash
npm run test
```

Todas las pruebas pasan. La app compila sin errores.

---

## FASE 2 — Firebase (reglas + índices)

**Objetivo:** Desplegar las nuevas reglas de seguridad e índices en Firestore.

**Riesgo:** MEDIO — Cambio en reglas de seguridad. Un error puede exponer datos.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `firestore.rules` | Agregar match blocks para `stores`, `dailyBudgets`, `storeBudgets` |
| `firestore.indexes.json` | Agregar 2 índices compuestos |

### Dependencias

- Fase 1 completada (tipos y servicios definidos)
- Backup de Firestore antes de desplegar

### Pruebas necesarias

| Prueba | Criterio de aceptación |
|--------|----------------------|
| Firestore rules (emulator) | CRUD de stores funciona para el owner |
| Firestore rules (emulator) | Usuario B no puede leer stores de usuario A |
| Firestore rules (emulator) | CRUD de dailyBudgets funciona |
| Firestore rules (emulator) | CRUD de storeBudgets funciona |
| Índices | Las queries por `purchaseDate` y `storeId + purchaseDate` no fallan |

### Verificación

```bash
# Desplegar índices
firebase deploy --only firestore:indexes

# Desplegar reglas
firebase deploy --only firestore:rules

# Verificar en consola de Firebase que no hay errores
```

### Rollback

```bash
# Revertir reglas
git checkout HEAD~1 -- firestore.rules
firebase deploy --only firestore:rules

# Revertir índices
git checkout HEAD~1 -- firestore.indexes.json
firebase deploy --only firestore:indexes
```

---

## FASE 3 — Registro de compras (con store)

**Objetivo:** Modificar el formulario de registro para asociar compras a stores.

**Riesgo:** MEDIO — Flujo principal de la app. Si falla, el usuario no puede registrar compras.

### Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/hooks/useStores.ts` | Hook para listar y crear stores |
| `src/components/StoreSelector.tsx` | Autocomplete de stores |
| `src/components/StoreBadge.tsx` | Badge visual del store |
| `src/components/DatePicker.tsx` | Selector de fecha de compra |

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/AddPurchase.tsx` | Agregar `StoreSelector` y `DatePicker` antes del formulario de productos |
| `src/services/purchases.ts` | Modificar `addPurchase()` para recibir y guardar `storeId`, `storeName`, `purchaseDate` |
| `src/hooks/useOCR.ts` | Agregar `storeId` al contexto OCR |
| `src/components/OCRReview.tsx` | Recibir y pasar `storeId` al guardar |

### Dependencias

- Fase 1 completada (tipos y servicios)
- Fase 2 completada (reglas e índices)

### Pruebas necesarias

| Prueba | Criterio de aceptación |
|--------|----------------------|
| `useStores.test.ts` | Lista stores, crea store nuevo |
| `StoreSelector.test.tsx` | Autocomplete funciona, selección funciona |
| `AddPurchase.test.tsx` | Formulario completo con store + fecha + productos |
| `purchases.test.ts` | Compra se guarda con `storeId`, `storeName`, `purchaseDate` |
| Flujo manual | Registrar compra → aparece en historial con store correcto |
| Flujo OCR | Foto → review → guardar con store seleccionado |
| Flujo legacy | Compra sin store (legacy) se muestra como "Sin establecimiento" |

### Verificación

```bash
npm run test
# Flujo manual completo: login → seleccionar store → registrar compra → ver en historial
```

---

## FASE 4 — Historial de compras

**Objetivo:** Rediseñar el historial para soportar vista por fecha y por store.

**Riesgo:** MEDIO — Reescritura completa de un componente clave.

### Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/components/HistoryByDate.tsx` | Vista agrupada por fecha |
| `src/components/HistoryByStore.tsx` | Vista agrupada por store |

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/PurchaseHistory.tsx` | Reescribir con toggle vista por fecha / por store + filtros |
| `src/services/purchases.ts` | Agregar `getPurchasesGroupedByDate()`, `getPurchasesByStore()`, `updatePurchaseStore()` |

### Dependencias

- Fase 3 completada (compras se guardan con store)

### Pruebas necesarias

| Prueba | Criterio de aceptación |
|--------|----------------------|
| `HistoryByDate.test.tsx` | Compras agrupadas por fecha, expandible |
| `HistoryByStore.test.tsx` | Compras agrupadas por store, total histórico |
| `PurchaseHistory.test.tsx` | Toggle entre vistas funciona |
| `purchases.test.ts` | `getPurchasesGroupedByDate()` retorna agrupación correcta |
| `purchases.test.ts` | `getPurchasesByStore()` retorna solo compras de ese store |
| Filtros | Filtro por rango de fechas funciona |
| Filtros | Filtro por store funciona |
| Reasignar store | Compra legacy se puede reasignar a un store |

### Verificación

```bash
npm run test
# Flujo manual: historial → vista por fecha → vista por store → filtro → reasignar store
```

---

## FASE 5 — Presupuesto diario

**Objetivo:** Reemplazar presupuesto mensual por presupuesto diario por store.

**Riesgo:** ALTO — Cambio de paradigma. Requiere UX clara para que el usuario entienda el nuevo modelo.

### Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/hooks/useDailyBudget.ts` | Hook para presupuesto diario |
| `src/components/DailyBudgetCard.tsx` | Card de presupuesto diario |

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Budget.tsx` | Reescribir: lista de stores con input de monto para cada uno |
| `src/services/budget.ts` | Deprecar (mantener solo para datos legacy) |

### Dependencias

- Fase 1 completada (tipos `DailyBudget`, `StoreBudget`)
- Fase 1 completada (servicios `dailyBudget.ts`, `storeBudget.ts`)

### Pruebas necesarias

| Prueba | Criterio de aceptación |
|--------|----------------------|
| `useDailyBudget.test.ts` | CRUD completo: crear, leer, actualizar budget diario |
| `useDailyBudget.test.ts` | CRUD completo: crear, leer, actualizar budget por store |
| `DailyBudgetCard.test.tsx` | Muestra total gastado / total presupuestado |
| `DailyBudgetCard.test.tsx` | Barra de progreso por store funciona |
| `Budget.test.tsx` | Formulario completo con stores y montos |
| `budget.test.ts` | Datos legacy siguen siendo legibles |
| Dashboard | Presupuesto diario se muestra correctamente |

### Verificación

```bash
npm run test
# Flujo manual: configurar budgets diarios por store → ver en Dashboard → verificar alertas
```

---

## FASE 6 — Dashboard

**Objetivo:** Reorganizar el Dashboard con la nueva jerarquía de prioridades.

**Riesgo:** ALTO — Es el componente central. Si falla, la app entera queda inutilizable.

### Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/components/TodayPurchases.tsx` | Lista resumida de compras del día |
| `src/pages/StoreManager.tsx` | Gestión de establecimientos |

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Dashboard.tsx` | Reescribir layout: compras hoy → registrar → presupuesto → historial → analítica |
| `src/components/ChartsSection.tsx` | Mover contenido a Analytics.tsx |
| `src/components/ChartsContent.tsx` | Reescribir con métricas por store |

### Dependencias

- Fase 3 completada (registro con store)
- Fase 4 completada (historial con store)
- Fase 5 completada (presupuesto diario)

### Pruebas necesarias

| Prueba | Criterio de aceptación |
|--------|----------------------|
| `TodayPurchases.test.tsx` | Lista compras del día agrupadas por store |
| `TodayPurchases.test.tsx` | Total del día se calcula correctamente |
| `StoreManager.test.tsx` | CRUD completo de stores |
| `Dashboard.test.tsx` | Nuevo layout funciona correctamente |
| `Dashboard.test.tsx` | Navegación entre secciones funciona |
| Flujo completo | Login → ver compras hoy → registrar → ver presupuesto → ver historial |

### Verificación

```bash
npm run test
# Flujo completo: login → Dashboard nuevo → todas las secciones funcionan
```

---

## FASE 7 — Analítica

**Objetivo:** Página dedicada de analítica con métricas por store.

**Riesgo:** BAJO — Componente nuevo, no afecta funcionalidad existente.

### Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/pages/Analytics.tsx` | Página dedicada de analítica |
| `src/components/StoreAnalytics.tsx` | Gráficas por store |

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/services/analytics.ts` | Agregar `getSpentByStore()`, `getPurchaseFrequency()`, `getDailySpend()`, `getStoreRanking()` |
| `src/App.tsx` | Agregar ruta `/analytics` |

### Dependencias

- Fase 6 completada (Dashboard con nuevo layout)

### Pruebas necesarias

| Prueba | Criterio de aceptación |
|--------|----------------------|
| `analytics.test.ts` | `getSpentByStore()` retorna gasto por store |
| `analytics.test.ts` | `getPurchaseFrequency()` retorna frecuencia correcta |
| `analytics.test.ts` | `getDailySpend()` retorna gasto diario |
| `analytics.test.ts` | `getStoreRanking()` retorna ranking correcto |
| `StoreAnalytics.test.tsx` | Gráficas renderizan correctamente |
| `Analytics.test.tsx` | Página completa funciona |

### Verificación

```bash
npm run test
# Flujo: Dashboard → Analytics → ver todas las gráficas → navegar de vuelta
```

---

## Resumen de fases

| Fase | Descripción | Riesgo | Dependencias | Esfuerzo estimado |
|------|-------------|--------|--------------|-------------------|
| 1 | Modelo de datos | BAJO | Ninguna | 3-4h |
| 2 | Firebase (reglas + índices) | MEDIO | Fase 1 | 1-2h |
| 3 | Registro de compras (con store) | MEDIO | Fases 1-2 | 4-5h |
| 4 | Historial de compras | MEDIO | Fase 3 | 3-4h |
| 5 | Presupuesto diario | ALTO | Fase 1 | 3-4h |
| 6 | Dashboard | ALTO | Fases 3-5 | 4-5h |
| 7 | Analítica | BAJO | Fase 6 | 2-3h |
| **Total** | | | | **20-27h** |

---

## Orden de ejecución recomendado

```
Fase 1 ──→ Fase 2 ──→ Fase 3 ──→ Fase 4
                  │
                  └──→ Fase 5 ──→ Fase 6 ──→ Fase 7
```

**Nota:** Fase 5 (presupuesto diario) puede ejecutarse en paralelo con Fase 3-4, ya que solo depende de Fase 1. Esto reduce el tiempo total en 3-4 horas.

---

## Criterios de aceptación globales

### Funcionalidad

1. El usuario puede crear stores (nombre, categoría, color, icono)
2. El usuario puede registrar compras asociadas a un store y fecha
3. El usuario puede ver historial por fecha y por store
4. El usuario puede configurar presupuesto diario por store
5. El usuario ve "Compras de hoy" como primer elemento del Dashboard
6. Las compras legacy (sin store) se muestran como "Sin establecimiento"
7. La analítica muestra métricas por store

### Seguridad

1. Un usuario no puede leer stores de otro usuario
2. Un usuario no puede modificar presupuestos de otro usuario
3. Las reglas de Firestore están desplegadas y funcionando
4. Los índices están creados y las queries no fallan

### Rendimiento

1. El Dashboard carga en menos de 2 segundos
2. Las queries por `purchaseDate` y `storeId` usan índices (no scans completos)
3. El bundle size no crece más de 20% respecto a v1

### Testing

1. Todas las pruebas existentes siguen pasando
2. Nuevas pruebas cubren: stores, dailyBudget, storeBudget, historial por store
3. Cobertura de código ≥ 70% en nuevos servicios

---

## Checklist de despliegue

### Antes de cada fase

- [ ] Backup de Firestore (si hay cambios de reglas)
- [ ] Todas las pruebas pasan (`npm run test`)
- [ ] Build exitoso (`npm run build`)
- [ ] No hay errores de TypeScript

### Después de cada fase

- [ ] Funcionalidad verificada manualmente
- [ ] No hay regresiones en funcionalidad existente
- [ ] Firestore rules desplegadas (si cambiaron)
- [ ] Firestore indexes desplegados (si cambiaron)

### Despliegue final

- [ ] Todas las 7 fases completadas
- [ ] Pruebas de integración pasan
- [ ] Backup de Firestore antes de migración
- [ ] Cloudflare Pages desplegado
- [ ] Verificación en producción: login → registro → historial → presupuesto → analítica

---

**Fin del documento. Pendiente de aprobación antes de comenzar Fase 1.**
