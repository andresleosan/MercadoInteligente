# IMPACTO COMPONENTES — Mercado Inteligente

**Fecha:** 2026-07-16
**Autor:** Cronos (Agencia Los Titanes)
**Estado:** PROPUESTA — Pendiente de aprobación

---

## Leyenda de Impacto

| Nivel | Significado |
|-------|-------------|
| **CRÍTICO** | Reescritura completa, funcionalidad rota si no se actualiza |
| **ALTO** | Modificaciones significativas, afecta flujo de usuario |
| **MEDIO** | Cambios menores, compatibilidad requerida |
| **BAJO** | Ajustes cosméticos o documentación |
| **SIN CAMBIO** | No afectado por la rearquitectura |

---

## 1. Páginas (`src/pages/`)

### 1.1 Dashboard.tsx — **CRÍTICO**

**Archivo actual:** `src/pages/Dashboard.tsx` (237 líneas)

**Estado actual:**
- Muestra: Presupuesto → Resumen del mes → Historial → Registrar compra → Gráficos
- Usa `selectedMonth` (string YYYY-MM)
- Lee: `getBudget()` mensual, `getTotalSpent()` mensual

**Cambios requeridos:**
1. Reescribir layout completo: "Compras de hoy" → Registrar → Presupuesto diario → Historial → Analítica
2. Reemplazar `selectedMonth` por `selectedDate` (YYYY-MM-DD)
3. Reemplazar `getBudget()` por `getDailyBudget()` + `getStoreBudgets()`
4. Reemplazar `getTotalSpent()` por `getTodayPurchases()`
5. Agregar componente `TodayPurchases`
6. Agregar componente `DailyBudgetCard`
7. Mover `ChartsSection` a página dedicada `Analytics.tsx`

**Archivos dependientes:**
- `src/services/budget.ts` → reemplazar por `dailyBudget.ts` + `storeBudget.ts`
- `src/services/purchases.ts` → agregar filtro por `purchaseDate`
- `src/pages/Budget.tsx` → reemplazar contenido
- `src/pages/PurchaseHistory.tsx` → reemplazar contenido
- `src/pages/AddPurchase.tsx` → reemplazar contenido
- `src/components/ChartsSection.tsx` → mover a Analytics

**Riesgo:** ALTO — Es el componente central. Si falla, la app entera queda inutilizable.

---

### 1.2 AddPurchase.tsx — **ALTO**

**Archivo actual:** `src/pages/AddPurchase.tsx` (299 líneas)

**Estado actual:**
- Formulario de productos (nombre, cantidad, precio unitario)
- Modo manual / foto (OCR) / voz
- No tiene selector de store ni fecha

**Cambios requeridos:**
1. Agregar `StoreSelector` al inicio del formulario
2. Agregar `DatePicker` (default: hoy)
3. Pasar `storeId`, `storeName`, `purchaseDate` a `addPurchase()`
4. Si el store no existe, permitir creación inline (nombre mínimo)
5. Actualizar flujo OCR para incluir store seleccionado
6. Actualizar flujo de voz para incluir store seleccionado

**Archivos dependientes:**
- `src/services/purchases.ts` → modificar `addPurchase()` para aceptar storeId, storeName, purchaseDate
- `src/hooks/useOCR.ts` → pasar storeId al contexto
- `src/components/OCRCapture.tsx` → sin cambio directo
- `src/components/OCRReview.tsx` → pasar storeId al guardar
- `src/components/VoiceCapture.tsx` → sin cambio directo

**Riesgo:** MEDIO — Flujo principal de la app. errores aquí bloquean el registro de compras.

---

### 1.3 PurchaseHistory.tsx — **CRÍTICO**

**Archivo actual:** `src/pages/PurchaseHistory.tsx` (150 líneas)

**Estado actual:**
- Lista cronológica de compras por mes
- Agrupación: plana (sin agrupación)
- Filtros: solo por mes

**Cambios requeridos:**
1. Reescribir completamente con dos vistas toggleables:
   - **Vista por fecha:** Agrupa compras por `purchaseDate`
   - **Vista por store:** Agrupa compras por `storeId`
2. Agregar filtros: rango de fechas, store específico
3. Mostrar total histórico por store en vista "por store"
4. Agregar botón para reasignar store a compras legacy
5. Paginación o scroll infinito (las compras crecen indefinidamente)

**Archivos dependientes:**
- `src/services/purchases.ts` → agregar `getPurchasesByStore()`, `getPurchasesGroupedByDate()`
- `src/components/StoreBadge.tsx` → nuevo, para mostrar store en cada compra

**Riesgo:** ALTO — Reescritura completa. Si falla, el usuario no puede ver su historial.

---

### 1.4 Budget.tsx — **CRÍTICO**

**Archivo actual:** `src/pages/Budget.tsx` (112 líneas)

**Estado actual:**
- Input simple: monto mensual
- Lee/escribe en `budgets/{month}`

**Cambios requeridos:**
1. Reescribir para soportar presupuesto diario por store
2. Mostrar lista de stores con input de monto para cada uno
3. Calcular y mostrar total diario (suma de store budgets)
4. Guardar en `dailyBudgets/{date}` + `storeBudgets/{date-storeId}`
5. Permitir configurar "presupuesto por defecto" para stores nuevos

**Archivos dependientes:**
- `src/services/budget.ts` → deprecar, reemplazar por `dailyBudget.ts` + `storeBudget.ts`
- `src/hooks/useStores.ts` → necesario para listar stores

**Riesgo:** ALTO — Cambio de paradigma (mensual → diario). Requiere UX clara.

---

### 1.5 Login.tsx — **SIN CAMBIO**

**Archivo actual:** `src/pages/Login.tsx`

**Cambios requeridos:** Ninguno. La autenticación no se ve afectada.

---

### 1.6 Register.tsx — **SIN CAMBIO**

**Archivo actual:** `src/pages/Register.tsx`

**Cambios requeridos:** Ninguno.

---

### 1.7 StoreManager.tsx — **NUEVO** (CRÍTICO)

**Propósito:** Gestión de establecimientos del usuario

**Funcionalidad:**
- Lista de stores del usuario (con color, icono, categoría)
- Crear store nuevo (nombre, categoría, color, icono)
- Editar store existente
- Eliminar store (con confirmación: "Las compras asociadas no se eliminarán")
- Buscar store por nombre

**Componentes internos:**
- `StoreForm.tsx` — formulario de creación/edición
- `StoreList.tsx` — lista de stores
- `StoreCard.tsx` — card individual con acciones

**Riesgo:** MEDIO — Componente nuevo, no afecta funcionalidad existente.

---

### 1.8 Analytics.tsx — **NUEVO** (ALTO)

**Propósito:** Página dedicada de analítica

**Funcionalidad:**
- Gasto por establecimiento (gráfica de barras)
- Frecuencia de compra por store (calendario de calor)
- Gasto diario (gráfica de línea)
- Comparativo mensual por establecimiento (grouped bar)
- Ranking de establecimientos (top 5 por gasto total)

**Componentes internos:**
- `StoreAnalytics.tsx` — gráficas por store
- `DailySpendChart.tsx` — tendencia diaria
- `FrequencyHeatmap.tsx` — calendario de frecuencia

**Riesgo:** MEDIO — Componente nuevo, puede desarrollarse en paralelo.

---

## 2. Componentes (`src/components/`)

### 2.1 ChartsSection.tsx — **ALTO**

**Archivo actual:** `src/components/ChartsSection.tsx` (23 líneas)

**Cambios requeridos:**
1. Mover contenido a `Analytics.tsx` (página dedicada)
2. `ChartsSection.tsx` se mantiene como wrapper lazy-loaded
3. Agregar nuevas gráficas por store

**Archivos dependientes:**
- `src/components/ChartsContent.tsx` → reescribir con métricas por store
- `src/services/analytics.ts` → agregar funciones por store

---

### 2.2 ChartsContent.tsx — **ALTO**

**Archivo actual:** `src/components/ChartsContent.tsx` (122 líneas)

**Cambios requeridos:**
1. Reemplazar gráfica "Gastado vs Presupuesto (6 meses)" por "Gasto por store (mes actual)"
2. Agregar gráfica "Frecuencia de compra por store"
3. Agregar gráfica "Gasto diario (últimos 30 días)"
4. Mantener "Top 5 productos" (sin cambio)
5. Agregar "Comparativo mensual por store"

**Archivos dependientes:**
- `src/services/analytics.ts` → agregar `getSpentByStore()`, `getPurchaseFrequency()`, `getDailySpend()`

---

### 2.3 MonthNavigator.tsx — **DEPRECADO**

**Archivo actual:** `src/components/MonthNavigator.tsx`

**Cambios requeridos:**
1. Reemplazar por navegación diaria (`DayNavigator.tsx`)
2. Mantener para compatibilidad en vistas de historial legacy
3. El Dashboard nuevo no lo usa

---

### 2.4 ProtectedRoute.tsx — **SIN CAMBIO**

**Archivo actual:** `src/components/ProtectedRoute.tsx` (24 líneas)

**Cambios requeridos:** Ninguno. La protección de rutas no se ve afectada.

---

### 2.5 OCRCapture.tsx — **BAJO**

**Archivo actual:** `src/components/OCRCapture.tsx`

**Cambios requeridos:**
1. No requiere cambios directos
2. El storeId se pasa desde el padre (`AddPurchase.tsx`)

---

### 2.6 OCRReview.tsx — **MEDIO**

**Archivo actual:** `src/components/OCRReview.tsx`

**Cambios requeridos:**
1. Recibir `storeId` como prop
2. Pasar `storeId` al llamar `addPurchase()`

---

### 2.7 ProductEditor.tsx — **SIN CAMBIO**

**Archivo actual:** `src/components/ProductEditor.tsx`

**Cambios requeridos:** Ninguno.

---

### 2.8 VoiceCapture.tsx — **BAJO**

**Archivo actual:** `src/components/VoiceCapture.tsx`

**Cambios requeridos:**
1. No requiere cambios directos
2. El storeId se pasa desde el padre (`AddPurchase.tsx`)

---

### 2.9 StoreSelector.tsx — **NUEVO** (ALTO)

**Propósito:** Autocomplete de establecimientos

**Funcionalidad:**
- Input con autocomplete de stores existentes
- Si el usuario escribe un nombre nuevo, offer "Crear store: {nombre}"
- Muestra badge de color/icono del store seleccionado
- Opción de gestionar stores (abre StoreManager)

**Props:**
```typescript
interface StoreSelectorProps {
  userId: string
  selectedStoreId: string | null
  onSelect: (store: Store) => void
  onCreateNew: (name: string) => void
}
```

---

### 2.10 StoreBadge.tsx — **NUEVO** (MEDIO)

**Propósito:** Badge visual del store

**Funcionalidad:**
- Muestra nombre + color + icono del store
- Tamaño: sm (en listas), md (en cards), lg (en headers)

**Props:**
```typescript
interface StoreBadgeProps {
  store: Store
  size?: 'sm' | 'md' | 'lg'
}
```

---

### 2.11 DatePicker.tsx — **NUEVO** (MEDIO)

**Propósito:** Selector de fecha de compra

**Funcionalidad:**
- Input de tipo date con estilo dark
- Default: hoy
- No permite fechas futuras
- No permite fechas anteriores a 30 días

**Props:**
```typescript
interface DatePickerProps {
  value: string // YYYY-MM-DD
  onChange: (date: string) => void
  maxDate?: string
  minDate?: string
}
```

---

### 2.12 DailyBudgetCard.tsx — **NUEVO** (ALTO)

**Propósito:** Card de presupuesto diario

**Funcionalidad:**
- Muestra total gastado hoy / total presupuestado hoy
- Barra de progreso por store
- Alerta cuando se supera el 80% o 100%

**Props:**
```typescript
interface DailyBudgetCardProps {
  date: string
  stores: Store[]
  budgets: StoreBudget[]
  spent: number
}
```

---

### 2.13 TodayPurchases.tsx — **NUEVO** (ALTO)

**Propósito:** Lista resumida de compras del día

**Funcionalidad:**
- Lista de compras de hoy agrupadas por store
- Total del día
- Última compra registrada

**Props:**
```typescript
interface TodayPurchasesProps {
  date: string
  purchases: Purchase[]
}
```

---

### 2.14 HistoryByDate.tsx — **NUEVO** (ALTO)

**Propósito:** Vista de historial agrupada por fecha

**Funcionalidad:**
- Lista de fechas con compras
- Cada fecha muestra stores visitados y total
- Expandible para ver detalle de cada fecha

---

### 2.15 HistoryByStore.tsx — **NUEVO** (ALTO)

**Propósito:** Vista de historial agrupada por store

**Funcionalidad:**
- Lista de stores con total histórico
- Cada store muestra compras individuales
- Badge de color/icono por store

---

### 2.16 StoreAnalytics.tsx — **NUEVO** (MEDIO)

**Propósito:** Gráficas de analítica por store

**Funcionalidad:**
- Gasto por store (barras)
- Frecuencia de compra por store (calendario)
- Comparativo mensual por store

---

### 2.17 ExpandableCard.tsx — **SIN CAMBIO**

**Archivo actual:** `src/components/ui/ExpandableCard.tsx`

**Cambios requeridos:** Ninguno.

---

### 2.18 DarkCard.tsx — **SIN CAMBIO**

**Archivo actual:** `src/components/ui/DarkCard.tsx`

**Cambios requeridos:** Ninguno.

---

### 2.19 DarkInput.tsx — **SIN CAMBIO**

**Archivo actual:** `src/components/ui/DarkInput.tsx`

**Cambios requeridos:** Ninguno.

---

### 2.20 DarkButton.tsx — **SIN CAMBIO**

**Archivo actual:** `src/components/ui/DarkButton.tsx`

**Cambios requeridos:** Ninguno.

---

### 2.21 EmptyState.tsx — **SIN CAMBIO**

**Archivo actual:** `src/components/ui/EmptyState.tsx`

**Cambios requeridos:** Ninguno.

---

### 2.22 KpiCard.tsx — **SIN CAMBIO**

**Archivo actual:** `src/components/ui/KpiCard.tsx`

**Cambios requeridos:** Ninguno.

---

### 2.23 ProgressBar.tsx — **SIN CAMBIO**

**Archivo actual:** `src/components/ui/ProgressBar.tsx`

**Cambios requeridos:** Ninguno.

---

### 2.24 MonthSelector.tsx — **DEPRECADO**

**Archivo actual:** `src/components/ui/MonthSelector.tsx`

**Cambios requeridos:**
1. Reemplazar por `DaySelector.tsx` en el Dashboard
2. Mantener para compatibilidad en vistas de historial legacy

---

## 3. Hooks (`src/hooks/`)

### 3.1 useAuth.ts — **SIN CAMBIO**

**Archivo actual:** `src/hooks/useAuth.ts` (1 línea — re-exporta de AuthContext)

**Cambios requeridos:** Ninguno.

---

### 3.2 useOCR.ts — **MEDIO**

**Archivo actual:** `src/hooks/useOCR.ts`

**Cambios requeridos:**
1. Agregar `storeId` al contexto OCR
2. Pasar `storeId` al llamar `addPurchase()` desde `OCRReview`

---

### 3.3 useVoice.ts — **BAJO**

**Archivo actual:** `src/hooks/useVoice.ts`

**Cambios requeridos:**
1. No requiere cambios directos
2. El storeId se pasa desde el padre

---

### 3.4 usePWAInstall.tsx — **SIN CAMBIO**

**Archivo actual:** `src/hooks/usePWAInstall.tsx`

**Cambios requeridos:** Ninguno.

---

### 3.5 useStores.ts — **NUEVO** (CRÍTICO)

**Propósito:** CRUD de establecimientos

**Funcionalidad:**
- `getStores(userId)` → lista de stores del usuario
- `createStore(userId, data)` → crear store nuevo
- `updateStore(userId, storeId, data)` → actualizar store
- `deleteStore(userId, storeId)` → eliminar store

**Hook:**
```typescript
function useStores(userId: string | null) {
  // Retorna: { stores, loading, error, create, update, delete }
}
```

---

### 3.6 useDailyBudget.ts — **NUEVO** (ALTO)

**Propósito:** CRUD de presupuesto diario

**Funcionalidad:**
- `getDailyBudget(userId, date)` → presupuesto del día
- `setDailyBudget(userId, date, amount)` → guardar presupuesto global
- `getStoreBudgets(userId, date)` → presupuestos por store
- `setStoreBudget(userId, date, storeId, amount)` → guardar presupuesto por store

**Hook:**
```typescript
function useDailyBudget(userId: string | null, date: string) {
  // Retorna: { globalBudget, storeBudgets, loading, error, setGlobal, setStore }
}
```

---

### 3.7 useTodayPurchases.ts — **NUEVO** (ALTO)

**Propósito:** Compras del día actual

**Funcionalidad:**
- `getTodayPurchases(userId, date)` → compras del día
- Actualización en tiempo real (opcional, v2)

**Hook:**
```typescript
function useTodayPurchases(userId: string | null, date: string) {
  // Retorna: { purchases, total, loading, error, refresh }
}
```

---

## 4. Servicios (`src/services/`)

### 4.1 auth.ts — **SIN CAMBIO**

**Archivo actual:** `src/services/auth.ts` (79 líneas)

**Cambios requeridos:** Ninguno.

---

### 4.2 purchases.ts — **ALTO**

**Archivo actual:** `src/services/purchases.ts` (138 líneas)

**Cambios requeridos:**
1. Modificar `addPurchase()` para aceptar `storeId`, `storeName`, `purchaseDate`
2. Modificar `getPurchases()` para filtrar por `purchaseDate` en vez de `createdAt`
3. Agregar `getPurchasesByStore(userId, storeId, month?)`
4. Agregar `getPurchasesGroupedByDate(userId, startDate, endDate)`
5. Agregar `getTodayPurchases(userId, date)`
6. Agregar `updatePurchaseStore(userId, purchaseId, storeId, storeName)` (para reasignar stores legacy)

---

### 4.3 budget.ts — **DEPRECADO**

**Archivo actual:** `src/services/budget.ts` (114 líneas)

**Cambios requeridos:**
1. Mantener para compatibilidad con datos legacy
2. No agregar nuevas funcionalidades
3. Los componentes nuevos usan `dailyBudget.ts` + `storeBudget.ts`

---

### 4.4 dailyBudget.ts — **NUEVO** (CRÍTICO)

**Propósito:** CRUD de presupuesto diario global

**Funcionalidad:**
- `getDailyBudget(userId, date)` → presupuesto del día
- `setDailyBudget(userId, date, amount)` → guardar/actualizar
- `getAllDailyBudgets(userId, startDate, endDate)` → histórico

---

### 4.5 storeBudget.ts — **NUEVO** (CRÍTICO)

**Propósito:** CRUD de presupuesto diario por store

**Funcionalidad:**
- `getStoreBudgets(userId, date)` → todos los budgets del día
- `setStoreBudget(userId, date, storeId, storeName, amount)` → guardar/actualizar
- `getStoreBudgetsByStore(userId, storeId, startDate, endDate)` → histórico por store

---

### 4.6 stores.ts — **NUEVO** (CRÍTICO)

**Propósito:** CRUD de establecimientos

**Funcionalidad:**
- `getStores(userId)` → listar stores del usuario
- `createStore(userId, data)` → crear store
- `updateStore(userId, storeId, data)` → actualizar store
- `deleteStore(userId, storeId)` → eliminar store

---

### 4.7 analytics.ts — **ALTO**

**Archivo actual:** `src/services/analytics.ts` (93 líneas)

**Cambios requeridos:**
1. Agregar `getSpentByStore(userId, startDate, endDate)` → gasto total por store
2. Agregar `getPurchaseFrequency(userId, storeId, monthsBack)` → frecuencia de compra
3. Agregar `getDailySpend(userId, daysBack)` → gasto diario
4. Agregar `getStoreRanking(userId, month)` → ranking de stores por gasto
5. Mantener `getTotalSpentByMonth()` y `getTopProducts()` para compatibilidad

---

### 4.8 storage.ts — **SIN CAMBIO**

**Archivo actual:** `src/services/storage.ts`

**Cambios requeridos:** Ninguno. Almacenamiento de fotos no se ve afectado.

---

### 4.9 supabase.ts — **SIN CAMBIO**

**Archivo actual:** `src/services/supabase.ts`

**Cambios requeridos:** Ninguno.

---

### 4.10 ocr.ts — **SIN CAMBIO**

**Archivo actual:** `src/services/ocr.ts`

**Cambios requeridos:** Ninguno. El OCR no depende del store.

---

### 4.11 ticketParser.ts — **SIN CAMBIO**

**Archivo actual:** `src/services/ticketParser.ts`

**Cambios requeridos:** Ninguno.

---

### 4.12 voice.ts — **SIN CAMBIO**

**Archivo actual:** `src/services/voice.ts`

**Cambios requeridos:** Ninguno.

---

### 4.13 voiceParser.ts — **SIN CAMBIO**

**Archivo actual:** `src/services/voiceParser.ts`

**Cambios requeridos:** Ninguno.

---

## 5. Tipos (`src/types/index.ts`)

### 5.1 User — **SIN CAMBIO**

**Campos:** uid, email, displayName, createdAt

---

### 5.2 Budget — **DEPRECADO**

**Acción:** Mantener para datos legacy. Los componentes nuevos usan `DailyBudget` + `StoreBudget`.

---

### 5.3 PurchaseItem — **SIN CAMBIO**

**Campos:** name, quantity, unitPrice, totalPrice, confidence

---

### 5.4 Purchase — **ALTO**

**Campos nuevos:**
```typescript
export interface Purchase {
  id: string
  userId: string
  storeId: string        // NUEVO
  storeName: string      // NUEVO
  purchaseDate: string   // NUEVO (YYYY-MM-DD)
  items: PurchaseItem[]
  total: number
  receiptImageUrl?: string
  createdAt: Date
}
```

---

### 5.5 ParsedItem — **SIN CAMBIO**

**Campos:** name, unitPrice, quantity, totalPrice, confidence

---

### 5.6 Store — **NUEVO** (CRÍTICO)

```typescript
export interface Store {
  id: string
  userId: string
  name: string
  category?: 'supermercado' | 'tienda' | 'barrio' | 'otro'
  color?: string   // hex: #10B981
  icon?: string    // emoji: 🛒
  createdAt: Date
}
```

---

### 5.7 DailyBudget — **NUEVO** (CRÍTICO)

```typescript
export interface DailyBudget {
  id: string
  userId: string
  date: string       // YYYY-MM-DD
  amount: number
  createdAt: Date
  updatedAt: Date
}
```

---

### 5.8 StoreBudget — **NUEVO** (CRÍTICO)

```typescript
export interface StoreBudget {
  id: string
  userId: string
  date: string       // YYYY-MM-DD
  storeId: string
  storeName: string
  amount: number
  createdAt: Date
  updatedAt: Date
}
```

---

## 6. Utilidades (`src/utils/`)

### 6.1 date.ts — **MEDIO**

**Archivo actual:** `src/utils/date.ts` (4 líneas)

**Cambios requeridos:**
1. Agregar `getCurrentDate(): string` → retorna YYYY-MM-DD
2. Agregar `formatDate(date: string): string` → formatea para visualización
3. Agregar `getDateRange(daysBack: number): { start: string, end: string }`
4. Mantener `getCurrentMonth()` para compatibilidad

---

## 7. Configuración (`src/config/`)

### 7.1 firebase.ts — **SIN CAMBIO**

**Archivo actual:** `src/config/firebase.ts` (56 líneas)

**Cambios requeridos:** Ninguno.

---

## 8. Resumen de impacto

### 8.1 Archivos a crear (13)

| Archivo | Tipo | Impacto |
|---------|------|---------|
| `src/types/index.ts` (modificar) | Tipos | ALTO |
| `src/services/stores.ts` | Servicio | CRÍTICO |
| `src/services/dailyBudget.ts` | Servicio | CRÍTICO |
| `src/services/storeBudget.ts` | Servicio | CRÍTICO |
| `src/hooks/useStores.ts` | Hook | CRÍTICO |
| `src/hooks/useDailyBudget.ts` | Hook | ALTO |
| `src/hooks/useTodayPurchases.ts` | Hook | ALTO |
| `src/pages/StoreManager.tsx` | Página | CRÍTICO |
| `src/pages/Analytics.tsx` | Página | ALTO |
| `src/components/StoreSelector.tsx` | Componente | ALTO |
| `src/components/StoreBadge.tsx` | Componente | MEDIO |
| `src/components/DatePicker.tsx` | Componente | MEDIO |
| `src/components/DailyBudgetCard.tsx` | Componente | ALTO |
| `src/components/TodayPurchases.tsx` | Componente | ALTO |
| `src/components/HistoryByDate.tsx` | Componente | ALTO |
| `src/components/HistoryByStore.tsx` | Componente | ALTO |
| `src/components/StoreAnalytics.tsx` | Componente | MEDIO |

### 8.2 Archivos a modificar (8)

| Archivo | Impacto | Descripción |
|---------|---------|-------------|
| `src/pages/Dashboard.tsx` | CRÍTICO | Reescritura completa |
| `src/pages/AddPurchase.tsx` | ALTO | Agregar store + fecha |
| `src/pages/PurchaseHistory.tsx` | CRÍTICO | Reescritura completa |
| `src/pages/Budget.tsx` | CRÍTICO | Reescritura completa |
| `src/services/purchases.ts` | ALTO | Agregar campos store + queries |
| `src/services/analytics.ts` | ALTO | Agregar métricas por store |
| `src/components/ChartsContent.tsx` | ALTO | Reescribir gráficas |
| `src/hooks/useOCR.ts` | MEDIO | Pasar storeId |
| `src/utils/date.ts` | MEDIO | Agregar funciones de fecha |

### 8.3 Archivos sin cambio (16)

| Archivo | Razón |
|---------|-------|
| `src/App.tsx` | Router no cambia |
| `src/main.tsx` | Entry point no cambia |
| `src/config/firebase.ts` | Config no cambia |
| `src/services/auth.ts` | Auth no cambia |
| `src/services/storage.ts` | Storage no cambia |
| `src/services/supabase.ts` | Supabase no cambia |
| `src/services/ocr.ts` | OCR no cambia |
| `src/services/ticketParser.ts` | Parser no cambia |
| `src/services/voice.ts` | Voice no cambia |
| `src/services/voiceParser.ts` | Parser no cambia |
| `src/hooks/useAuth.ts` | Auth no cambia |
| `src/hooks/usePWAInstall.tsx` | PWA no cambia |
| `src/pages/Login.tsx` | Auth no cambia |
| `src/pages/Register.tsx` | Auth no cambia |
| `src/components/ProtectedRoute.tsx` | Protección no cambia |
| `src/components/OCRCapture.tsx` | OCR no cambia |
| `src/components/ProductEditor.tsx` | Editor no cambia |
| `src/components/VoiceCapture.tsx` | Voice no cambia |
| `src/components/ui/ExpandableCard.tsx` | UI no cambia |
| `src/components/ui/DarkCard.tsx` | UI no cambia |
| `src/components/ui/DarkInput.tsx` | UI no cambia |
| `src/components/ui/DarkButton.tsx` | UI no cambia |
| `src/components/ui/EmptyState.tsx` | UI no cambia |
| `src/components/ui/KpiCard.tsx` | UI no cambia |
| `src/components/ui/ProgressBar.tsx` | UI no cambia |

### 8.4 Archivos a deprecar (2)

| Archivo | Razón |
|---------|-------|
| `src/services/budget.ts` | Reemplazado por dailyBudget + storeBudget |
| `src/components/MonthNavigator.tsx` | Reemplazado por DayNavigator |

---

**Fin del documento. Pendiente de aprobación.**
