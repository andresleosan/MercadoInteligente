# Diseño — Categorización Automática de Productos

**Fecha:** 2026-07-20
**Fase:** v3 — Crecimiento, Fase 1
**Estado:** Aprobado

---

## Objetivo

Implementar categorización automática de productos con:
- Categorías editables por el usuario
- Sugerencia automática por aprendizaje del usuario + diccionario local
- Badge visual en formulario de registro e historial
- Filtro por categoría en el historial

---

## Modelo de datos

### Tipos a agregar en `src/types/index.ts`

```typescript
// Categorías predefinidas
export type DefaultCategoryId =
  | 'lacteos' | 'panaderia' | 'carnes' | 'frutas-verduras'
  | 'bebidas' | 'limpieza' | 'higiene' | 'snacks' | 'otro'

// Categoría = predefinida o custom del usuario
export interface Category {
  id: string
  name: string
  icon: string          // emoji
  isDefault: boolean    // true = sistema, false = usuario creó
}

// Mapping de aprendizaje del usuario
export interface CategoryMapping {
  id: string
  productName: string   // normalizado (minúsculas, sin espacios extra)
  categoryId: string
  userId: string
  createdAt: Date
}
```

### Campo a agregar a `PurchaseItem`

```typescript
export interface PurchaseItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  confidence?: number
  category?: string     // ← NUEVO: id de categoría
}
```

### Colecciones Firestore

| Ruta | Descripción |
|------|-------------|
| `users/{uid}/categories/{categoryId}` | Categorías del usuario (default + custom) |
| `users/{uid}/categoryMappings/{mappingId}` | Mapa de aprendizaje producto → categoría |

---

## Lógica de categorización

### Diccionario local de keywords

En `src/services/categorizer.ts`:

```typescript
const KEYWORD_MAP: Record<string, string> = {
  // Lácteos
  'leche': 'lacteos', 'queso': 'lacteos', 'yogur': 'lacteos', 'manteca': 'lacteos',
  'crema': 'lacteos', 'dulce-de-leche': 'lacteos',
  // Panadería
  'pan': 'panaderia', 'galletas': 'panaderia', 'facturas': 'panaderia',
  'bizcocho': 'panaderia', 'tortilla': 'panaderia',
  // Carnes
  'carne': 'carnes', 'pollo': 'carnes', 'cerdo': 'carnes', 'atun': 'carnes',
  'jamón': 'carnes', 'salchichas': 'carnes', 'chorizo': 'carnes',
  // Frutas y verduras
  'manzana': 'frutas-verduras', 'lechuga': 'frutas-verduras', 'tomate': 'frutas-verduras',
  'papa': 'frutas-verduras', 'cebolla': 'frutas-verduras', 'zanahoria': 'frutas-verduras',
  'naranja': 'frutas-verduras', 'banana': 'frutas-verduras', 'limon': 'frutas-verduras',
  // Bebidas
  'agua': 'bebidas', 'jugo': 'bebidas', 'coca': 'bebidas', 'cerveza': 'bebidas',
  'vino': 'bebidas', 'gaseosa': 'bebidas', 'cafe': 'bebidas',
  // Limpieza
  'lavandina': 'limpieza', 'detergente': 'limpieza', 'jabon': 'limpieza',
  'esponja': 'limpieza', 'bolsa': 'limpieza', 'papel-higienico': 'limpieza',
  // Higiene
  'shampoo': 'higiene', 'cepillo': 'higiene', 'pasta': 'higiene',
  'desodorante': 'higiene', 'jabon': 'higiene', 'toalla': 'higiene',
  // Snacks
  'papa-frita': 'snacks', 'maní': 'snacks', ' chocolate': 'snacks',
  'caramelo': 'snacks', 'golosinas': 'snacks',
}
```

### Flujo de sugerencia

```
suggestCategory(userId, productName):
  1. Normalizar productName (lowercase, trim)
  2. Buscar en categoryMappings del usuario → si hay match, retornar categoryId
  3. Buscar en KEYWORD_MAP por cada palabra del nombre → si hay match, retornar categoryId
  4. Si no hay match, retornar null (sin categoría sugerida)
```

---

## Servicios

### `src/services/categories.ts`

| Función | Descripción |
|---------|-------------|
| `getCategories(userId)` | Retorna categorías default + custom del usuario |
| `createCategory(userId, name, icon)` | Crea categoría custom |
| `updateCategory(userId, id, data)` | Actualiza categoría custom |
| `deleteCategory(userId, id)` | Elimina categoría custom (no default) |

### `src/services/categoryMapping.ts`

| Función | Descripción |
|---------|-------------|
| `getCategoryForProduct(userId, productName)` | Busca mapping existente |
| `saveCategoryMapping(userId, productName, categoryId)` | Guarda/actualiza preferencia |
| `getMappingsByCategory(userId, categoryId)` | Retorna todos los mappings de una categoría |

### `src/services/categorizer.ts`

| Función | Descripción |
|---------|-------------|
| `suggestCategory(userId, productName)` | Flujo de sugerencia (learning → keywords → null) |
| `normalizeProductName(name)` | Normaliza para comparación |

---

## Componentes UI

### `src/components/CategoryBadge.tsx`

Badge visual que muestra emoji + nombre de categoría.

**Props:**
```typescript
interface CategoryBadgeProps {
  category: Category
  editable?: boolean
  onEdit?: () => void
}
```

**Colores por categoría:**
| Categoría | Color de fondo |
|-----------|----------------|
| Lácteos | `bg-blue-500/20 text-blue-300` |
| Panadería | `bg-amber-500/20 text-amber-300` |
| Carnes | `bg-red-500/20 text-red-300` |
| Frutas y verduras | `bg-green-500/20 text-green-300` |
| Bebidas | `bg-cyan-500/20 text-cyan-300` |
| Limpieza | `bg-purple-500/20 text-purple-300` |
| Higiene | `bg-pink-500/20 text-pink-300` |
| Snacks | `bg-orange-500/20 text-orange-300` |
| Otro | `bg-gray-500/20 text-gray-300` |

### `src/components/CategorySelector.tsx`

Dropdown de selección de categoría.

**Props:**
```typescript
interface CategorySelectorProps {
  userId: string
  selectedCategoryId?: string
  onSelect: (categoryId: string | null) => void
  compact?: boolean      // variante compacta para usar inline
}
```

**Funcionalidades:**
- Lista categorías (default + custom)
- Botón "+" para crear nueva categoría inline
- Búsqueda por nombre
- Muestra emoji + nombre

### `src/components/CategoryManager.tsx`

Gestión completa de categorías.

**Funcionalidades:**
- Lista todas las categorías
- Editar nombre/icono de categorías custom
- Eliminar categorías custom
- Crear nuevas categorías
- Reordenar (opcional, futuro)

---

## Integración en componentes existentes

### `AddPurchase.tsx`

```
1. Al escribir en campo "Producto":
   - Llamar suggestCategory() con debounce de 300ms
   - Mostrar CategorySelector con sugerencia pre-seleccionada
   - Usuario puede cambiar categoría antes de guardar

2. Al guardar:
   - Incluir category en PurchaseItem
   - Si usuario cambió categoría, guardar mapping para learning
```

### `OCRReview.tsx`

```
1. Al parsear productos del ticket:
   - Para cada producto, llamar suggestCategory()
   - Pre-seleccionar categoría sugerida
   - Usuario puede revisar/cambiar antes de guardar

2. Al guardar:
   - Incluir category en cada PurchaseItem
   - Guardar mappings para learning
```

### `PurchaseHistory.tsx`

```
1. Mostrar CategoryBadge al lado de cada producto

2. Agregar filtro por categoría arriba de la lista:
   - Dropdown con todas las categorías usadas
   - Opción "Todas" para quitar filtro
   - Filtrar productos por categoría seleccionada
```

### `TodayPurchases.tsx`

```
1. Mostrar CategoryBadge al lado de cada producto
```

---

## Criterios de aceptación

1. ✅ Categorías default aparecen al crear usuario
2. ✅ Usuario puede crear, editar y eliminar categorías custom
3. ✅ Al escribir nombre de producto, categoría se sugiere automáticamente
4. ✅ Sugerencia usa learning del usuario (prioridad) y keywords (fallback)
5. ✅ Categoría es editable antes de guardar en formulario y revisión OCR
6. ✅ Badge de categoría se muestra en historial y compras de hoy
7. ✅ Filtro por categoría funciona en historial
8. ✅ Compras legacy (sin categoría) se muestran sin badge
9. ✅ Todas las pruebas pasan
10. ✅ Build de producción sin errores

---

## Orden de implementación

1. Tipos y servicios (categories, categoryMapping, categorizer)
2. Hook useCategories
3. Componentes UI (CategoryBadge, CategorySelector, CategoryManager)
4. Integración en AddPurchase + OCRReview
5. Integración en PurchaseHistory + TodayPurchases
6. Filtro por categoría en historial
7. Tests
8. Verificación final
