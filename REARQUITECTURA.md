# REARQUITECTURA — Mercado Inteligente

**Fecha:** 2026-07-16 (propuesta) / 2026-07-17 (implementada)
**Arquitecto:** Cronos (Agencia Los Titanes)
**Estado:** IMPLEMENTADA — Todas las 7 fases completadas

---

## 1. Estado Actual

### 1.1 Modelo de datos vigente

```
users/{uid}
  ├── profile: { email, displayName, createdAt }
  ├── budgets/{month}          → { userId, month, amount, createdAt, updatedAt }
  └── purchases/{purchaseId}   → { userId, items[], total, receiptImageUrl, createdAt }
```

**Jerarquía:** Usuario → Presupuesto mensual → Compras (sin asociación a establecimiento)

### 1.2 Flujo de usuario actual

```
1. Login / Registro
2. Configurar presupuesto mensual
3. Registrar compra (manual / foto / voz)
4. Ver resumen mensual (gasto vs presupuesto)
5. Ver historial (lista cronológica por mes)
6. Ver gráficos (tendencia 6 meses, top productos)
```

### 1.3 Problema del modelo actual

El usuario no planifica compras mensuales. El usuario compra **todos los días** en **establecimientos específicos** y necesita:

- Saber cuánto gastó hoy
- Saber cuánto gastó en Ara / D1 / Éxito esta semana
- Comparar precios entre establecimientos
- Controlar el gasto **diario**, no el mensual

El modelo actual no soporta ninguna de estas necesidades porque:
- No existe la entidad `Store`
- `Purchase` no tiene `storeId` ni `purchaseDate` (solo `createdAt`)
- El presupuesto es mensual, no diario
- El historial solo muestra lista plana por mes, sin agrupación por establecimiento

---

## 2. Estado Objetivo

### 2.1 Nuevo modelo de datos

```
users/{uid}
  ├── profile: { email, displayName, createdAt }
  ├── stores/{storeId}              → { userId, name, category, color, icon, createdAt }
  ├── dailyBudgets/{date}           → { userId, date, amount, createdAt, updatedAt }
  ├── storeBudgets/{date-storeId}   → { userId, date, storeId, storeName, amount, createdAt, updatedAt }
  └── purchases/{purchaseId}        → { userId, storeId, storeName, purchaseDate, items[], total, receiptImageUrl, createdAt }
```

### 2.2 Entidades

#### Store (NUEVA)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id | string | auto | ID del documento Firestore |
| userId | string | sí | Propietario |
| name | string | sí | Nombre del establecimiento (Ara, D1, Éxito...) |
| category | string | no | Categoría: supermercado, tienda, barrio, etc. |
| color | string | no | Color para identificación visual |
| icon | string | no | Icono o emoji representativo |
| createdAt | Timestamp | sí | Fecha de creación |

**Justificación de campos opcionales:**
- `category`: habilita filtros y agrupación por tipo de establecimiento
- `color` + `icon`: mejora la UX visual en listas y gráficos (ej: Ara = verde, D1 = azul)
- Son opcionales para no bloquear la creación rápida de un store

#### Purchase (EVOLUCIONADA)

| Campo | Tipo | Antes | Ahora |
|-------|------|-------|-------|
| id | string | auto | auto (sin cambio) |
| userId | string | sí | sí (sin cambio) |
| storeId | string | NO EXISTÍA | **NUEVO** — referencia a stores/{storeId} |
| storeName | string | NO EXISTÍA | **NUEVO** — denormalizado para consultas |
| purchaseDate | string | NO EXISTÍA | **NUEVO** — "2026-07-16" (YYYY-MM-DD) |
| items | PurchaseItem[] | sí | sí (sin cambio) |
| total | number | sí | sí (sin cambio) |
| receiptImageUrl | string | no | no (sin cambio) |
| createdAt | Timestamp | sí | sí (sin cambio) |

**Por qué `storeName` denormalizado:** Firestore no permite JOINs. Sin `storeName`, cada lectura de compras requeriría una consulta adicional a `stores/{storeId}` para mostrar el nombre. El costo de duplicar 20-30 caracteres es menor al costo de N consultas extra por sesión.

**Por qué `purchaseDate` separado de `createdAt`:** `createdAt` se genera automáticamente al guardar. Pero el usuario puede registrar una compra del martes el jueves. `purchaseDate` permite que el usuario seleccione la fecha real de la compra.

#### Budget → DailyBudget + StoreBudget (REEMPLAZADA)

**Opción A: Presupuesto diario global**

```
dailyBudgets/{YYYY-MM-DD}
  → { userId, date, amount, createdAt, updatedAt }
```

**Opción B: Presupuesto diario por establecimiento**

```
storeBudgets/{YYYY-MM-DD_storeId}
  → { userId, date, storeId, storeName, amount, createdAt, updatedAt }
```

**Decisión: Opción B (por establecimiento) es más escalable.**

Justificación:
1. El usuario que compra en Ara no gasta lo mismo que en Éxito
2. Permite comparar presupuesto real vs ejecutado por tienda
3. El presupuesto global se calcula como suma de los store budgets del día
4. Permite alertas granulares: "Ya gastaste tu presupuesto en D1 hoy"
5. Es extensible: si mañana se quiere poner presupuesto semanal, la estructura ya tiene `storeId`

### 2.3 Nuevos flujos de usuario

#### Flujo 1: Registro de compra (prioridad máxima)

```
1. Usuario abre la app
2. Ve "Compras de hoy" (resumen rápido)
3. Toca "Registrar compra"
4. Selecciona establecimiento (autocomplete de stores existentes)
   └── Si no existe: crear store inline (nombre mínimo)
5. Selecciona fecha de compra (default: hoy)
6. Registra productos (manual / foto / voz)
7. Guarda → compra asociada a store + fecha
```

#### Flujo 2: Historial por establecimiento

```
1. Usuario toca "Historial"
2. Ve dos vistas toggleables:
   a. Por fecha:  16 Jul → Ara, D1, Éxito
   b. Por store:  Ara → compra 1, compra 2, compra 3
3. Puede filtrar por: rango de fechas, establecimiento
4. Ve total histórico por store
```

#### Flujo 3: Dashboard diario

```
1. Header: "Hoy: $XX / $YY presupuestado"
2. Compras de hoy (lista resumida por store)
3. Botón "Registrar compra"
4. Presupuesto diario por store (barra de progreso)
5. Historial rápido (últimas 5 compras)
6. Acceso a analítica completa
```

#### Flujo 4: Analítica

```
1. Gasto por establecimiento (gráfica de barras)
2. Frecuencia de compra por store (calendario de calor)
3. Gasto diario (gráfica de línea)
4. Comparativo mensual por establecimiento (grouped bar)
5. Ranking de establecimientos (top 5 por gasto total)
```

---

## 3. Diagrama de Entidades

```
┌─────────────────────────────────────────────────────────┐
│                        User                             │
│  { uid, email, displayName, createdAt }                │
└──────────┬──────────────────────────────┬───────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│       Store          │    │       DailyBudget            │
│  { name, category,   │    │  { date, amount }            │
│    color, icon }     │    └──────────────────────────────┘
└──────────┬───────────┘              │
           │                          ▼
           │              ┌──────────────────────────────┐
           │              │       StoreBudget            │
           │              │  { date, storeId, amount }   │
           │              └──────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────────┐
│                    Purchase                           │
│  { storeId, storeName, purchaseDate, items[], total } │
└──────────────────────────────────────────────────────┘
```

---

## 4. Cambios Requeridos por Capa

### 4.1 Tipos TypeScript (`src/types/index.ts`)

| Tipo | Acción | Impacto |
|------|--------|---------|
| `Store` | **CREAR** | Nuevo |
| `DailyBudget` | **CREAR** | Nuevo |
| `StoreBudget` | **CREAR** | Nuevo |
| `Purchase` | **MODIFICAR** | Agregar storeId, storeName, purchaseDate |
| `PurchaseItem` | Sin cambio | — |
| `Budget` | **DEPRECAR** | Reemplazado por DailyBudget + StoreBudget |
| `User` | Sin cambio | — |

### 4.2 Servicios Firebase (`src/services/`)

| Servicio | Acción | Impacto |
|----------|--------|---------|
| `stores.ts` | **CREAR** | CRUD de establecimientos |
| `dailyBudget.ts` | **CREAR** | Presupuesto diario global |
| `storeBudget.ts` | **CREAR** | Presupuesto diario por store |
| `purchases.ts` | **MODIFICAR** | Agregar storeId, storeName, purchaseDate a addPurchase; cambiar queries |
| `budget.ts` | **DEPRECAR** | Reemplazado por dailyBudget + storeBudget |
| `auth.ts` | Sin cambio | — |
| `analytics.ts` | **MODIFICAR** | Agregar métricas por store |
| `ocr.ts` | Sin cambio | — |
| `storage.ts` | Sin cambio | — |

### 4.3 Hooks (`src/hooks/`)

| Hook | Acción | Impacto |
|------|--------|---------|
| `useStores.ts` | **CREAR** | Listar, crear, seleccionar stores |
| `useDailyBudget.ts` | **CREAR** | CRUD presupuesto diario |
| `useStoreBudget.ts` | **CREAR** | CRUD presupuesto por store |
| `useTodayPurchases.ts` | **CREAR** | Compras del día actual |
| `useAuth.ts` | Sin cambio | — |
| `useOCR.ts` | **MODIFICAR** | Agregar storeId al contexto OCR |

### 4.4 Páginas (`src/pages/`)

| Página | Acción | Impacto |
|--------|--------|---------|
| `Dashboard.tsx` | **REESCRIBIR** | Nuevo layout: compras hoy → registrar → presupuesto → historial → analítica |
| `AddPurchase.tsx` | **MODIFICAR** | Agregar selector de store + fecha |
| `PurchaseHistory.tsx` | **REESCRIBIR** | Dos vistas (por fecha / por store) + filtros |
| `Budget.tsx` | **REESCRIBIR** | Presupuesto diario por store |
| `StoreManager.tsx` | **CREAR** | Gestión de establecimientos |
| `Analytics.tsx` | **CREAR** | Página dedicada de analítica |
| `Login.tsx` | Sin cambio | — |
| `Register.tsx` | Sin cambio | — |

### 4.5 Componentes (`src/components/`)

| Componente | Acción | Impacto |
|------------|--------|---------|
| `StoreSelector.tsx` | **CREAR** | Autocomplete de stores |
| `StoreBadge.tsx` | **CREAR** | Badge visual con color/icono del store |
| `DatePicker.tsx` | **CREAR** | Selector de fecha de compra |
| `DailyBudgetCard.tsx` | **CREAR** | Card de presupuesto diario |
| `TodayPurchases.tsx` | **CREAR** | Lista resumida del día |
| `HistoryByDate.tsx` | **CREAR** | Vista agrupada por fecha |
| `HistoryByStore.tsx` | **CREAR** | Vista agrupada por store |
| `StoreAnalytics.tsx` | **CREAR** | Gráficas por store |
| `ChartsSection.tsx` | **MODIFICAR** | Agregar métricas por store |
| `MonthNavigator.tsx` | **DEPRECAR** | Reemplazado por navegación diaria |

### 4.6 Firestore Rules (`firestore.rules`)

```javascript
// Nuevas reglas necesarias
match /stores/{storeId} {
  allow read, write: if isAuthenticated() && isOwner(userId);
}

match /dailyBudgets/{date} {
  allow read, write: if isAuthenticated() && isOwner(userId);
}

match /storeBudgets/{dateStoreId} {
  allow read, write: if isAuthenticated() && isOwner(userId);
}
```

### 4.7 Firestore Indexes (`firestore.indexes.json`)

```json
{
  "indexes": [
    {
      "collectionGroup": "purchases",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "purchaseDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "purchases",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "storeId", "order": "ASCENDING" },
        { "fieldPath": "purchaseDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "purchases",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 5. Compatibilidad hacia atrás

### 5.1 Compras existentes

Las compras que ya existen en Firestore **no tienen** `storeId`, `storeName` ni `purchaseDate`.

**Estrategia:**
1. Las compras sin `storeId` se muestran como "Sin establecimiento"
2. El usuario puede reasignar stores retroactivamente desde el historial
3. `purchaseDate` se inicializa como `createdAt.toDate().toISOString().split('T')[0]` para compras viejas
4. No se borran datos existentes — solo se enriquecen

### 5.2 Presupuesto mensual existente

Los budgets mensuales en `budgets/{month}` **siguen siendo válidos** como referencia histórica.

**Estrategia:**
1. No se borran los budgets mensuales existentes
2. Se crea la nueva estructura `dailyBudgets` y `storeBudgets` en paralelo
3. El Dashboard puede mostrar ambos (legacy + nuevo) durante transición
4. Se deprecan gradualmente — los componentes nuevos solo usan dailyBudget/storeBudget

---

## 6. Análisis de escalabilidad

### 6.1 Opción A vs Opción B (presupuesto)

| Criterio | Opción A (global) | Opción B (por store) |
|----------|-------------------|----------------------|
| Complejidad de implementación | Baja | Media |
| Granularidad del control | Baja (solo total día) | Alta (por tienda) |
| UX del usuario | Simple | Más completa |
| Escalabilidad futura | Limitada | Excelente |
| Costo Firestore (lecturas) | 1 doc/día | N docs/día (N=stores activos) |
| **Decisión** | | **GANA** |

**Opción B gana** porque:
- El costo adicional es mínimo (1-3 docs extra por día)
- La granularidad permite alertas y comparativas por store
- Es extensible a presupuesto semanal/mensual sin cambiar estructura
- El usuario real compra en múltiples tiendas y necesita control individual

### 6.2 Índices Firestore

Con la nueva estructura se requieren 3 índices compuestos:
1. `purchases` por `userId + purchaseDate` (historial por fecha)
2. `purchases` por `userId + storeId + purchaseDate` (historial por store)
3. `purchases` por `userId + createdAt` (compatibilidad con queries actuales)

---

## 7. Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Migración de datos rompe funcionalidad existente | Media | Alto | Estrategia dual: viejo + nuevo en paralelo |
| Usuarios existentes no entienden el nuevo flujo | Baja | Medio | Onboarding引导: "Asociá tu compra a un store" |
| Firestore rules incorrectas exponen datos | Baja | Crítico | Testing exhaustivo de rules antes de deploy |
| Queries lentas sin índices | Media | Alto | Crear índices antes de desplegar |
| Bundle size crece con nuevos componentes | Media | Bajo | Lazy loading (ya implementado) |

---

**Fin del documento. IMPLEMENTADO — 2026-07-17.**
