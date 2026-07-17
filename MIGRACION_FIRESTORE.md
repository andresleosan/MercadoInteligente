# MIGRACIÓN FIRESTORE — Mercado Inteligente

**Fecha:** 2026-07-16
**Autor:** Cronos (Agencia Los Titanes)
**Estado:** PROPUESTA — Pendiente de aprobación

---

## 1. Colecciones Actuales

```
users/{uid}
  ├── (documento raíz del usuario)
  ├── budgets/{month}           → presupuesto mensual
  └── purchases/{purchaseId}    → compra registrada
```

### 1.1 Esquema actual detallado

#### `users/{uid}`
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string | null",
  "createdAt": "Timestamp"
}
```

#### `users/{uid}/budgets/{month}`
```json
{
  "userId": "string",
  "month": "string (YYYY-MM)",
  "amount": "number",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

#### `users/{uid}/purchases/{purchaseId}`
```json
{
  "userId": "string",
  "items": [
    {
      "name": "string",
      "quantity": "number",
      "unitPrice": "number",
      "totalPrice": "number",
      "confidence": "number (opcional)"
    }
  ],
  "total": "number",
  "receiptImageUrl": "string (opcional)",
  "createdAt": "Timestamp"
}
```

---

## 2. Colecciones Nuevas

```
users/{uid}
  ├── (documento raíz del usuario)        → SIN CAMBIO
  ├── stores/{storeId}                     → NUEVA
  ├── dailyBudgets/{YYYY-MM-DD}            → NUEVA
  ├── storeBudgets/{YYYY-MM-DD_storeId}    → NUEVA
  ├── budgets/{month}                      → DEPRECADA (mantener para histórico)
  └── purchases/{purchaseId}               → MODIFICADA (3 campos nuevos)
```

### 2.1 Esquema nuevo detallado

#### `users/{uid}/stores/{storeId}` (NUEVA)
```json
{
  "userId": "string",
  "name": "string",
  "category": "string (opcional: supermercado | tienda | barrio | otro)",
  "color": "string (opcional, hex: #10B981)",
  "icon": "string (opcional, emoji: 🛒)",
  "createdAt": "Timestamp"
}
```

**Documentos esperados por usuario:** 3-10 (uno por tienda que frecuenta)

#### `users/{uid}/dailyBudgets/{YYYY-MM-DD}` (NUEVA)
```json
{
  "userId": "string",
  "date": "string (YYYY-MM-DD)",
  "amount": "number",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

**Documentos esperados por usuario:** 1 por día activo (máx ~30/mes)

#### `users/{uid}/storeBudgets/{YYYY-MM-DD_storeId}` (NUEVA)
```json
{
  "userId": "string",
  "date": "string (YYYY-MM-DD)",
  "storeId": "string",
  "storeName": "string (denormalizado)",
  "amount": "number",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

**Documentos esperados por usuario:** 1-3 por día (uno por store activo)

#### `users/{uid}/purchases/{purchaseId}` (MODIFICADA)

**Campos nuevos:**
```json
{
  "storeId": "string (opcional para compras legacy)",
  "storeName": "string (opcional para compras legacy)",
  "purchaseDate": "string (YYYY-MM-DD, opcional para compras legacy)"
}
```

**Campos existentes sin cambio:**
- `userId`, `items[]`, `total`, `receiptImageUrl`, `createdAt`

---

## 3. Cambios de Esquema

### 3.1 Modificaciones a purchases

| Campo | Tipo | Obligatorio | Default para legacy |
|-------|------|-------------|---------------------|
| storeId | string | Sí (nuevas) | `""` (vacío) |
| storeName | string | Sí (nuevas) | `"Sin establecimiento"` |
| purchaseDate | string | Sí (nuevas) | `createdAt.toDate().toISOString().split('T')[0]` |

### 3.2 Nuevos índices requeridos

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
    }
  ]
}
```

### 3.3 Nuevas reglas de seguridad

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
      
      // DEPRECADA — mantener solo para histórico
      match /budgets/{budgetId} {
        allow read, write: if isAuthenticated() && isOwner(userId);
      }
      
      match /purchases/{purchaseId} {
        allow read, write: if isAuthenticated() && isOwner(userId);
      }
      
      // NUEVAS
      match /stores/{storeId} {
        allow read, write: if isAuthenticated() && isOwner(userId);
      }
      
      match /dailyBudgets/{date} {
        allow read, write: if isAuthenticated() && isOwner(userId);
      }
      
      match /storeBudgets/{dateStoreId} {
        allow read, write: if isAuthenticated() && isOwner(userId);
      }
    }
  }
}
```

---

## 4. Compatibilidad hacia atrás

### 4.1 Estrategia de migración

**Enfoque: Migración gradual, sin corte de servicio**

No hay un script de migración puntual. La app evoluciona para:
1. Leer datos nuevos cuando existan
2. Fallback a datos legacy cuando no
3. Escribir siempre en el nuevo formato

### 4.2 Compras legacy (sin storeId)

**Lectura:**
```typescript
// En purchases.ts — getPurchases
const purchase = {
  id: doc.id,
  userId: data.userId,
  items: data.items,
  total: data.total,
  receiptImageUrl: data.receiptImageUrl,
  createdAt: data.createdAt?.toDate() || new Date(),
  // Campos nuevos con fallback
  storeId: data.storeId || '',
  storeName: data.storeName || 'Sin establecimiento',
  purchaseDate: data.purchaseDate || data.createdAt?.toDate().toISOString().split('T')[0] || '',
}
```

**Visualización:**
- Compras sin `storeId` se muestran con badge "Sin establecimiento"
- Se puede reasignar store desde el historial (opcional, no obligatorio)

### 4.3 Presupuesto mensual legacy

**Lectura:**
- Los budgets en `budgets/{month}` se mantienen como referencia
- El Dashboard nuevo lee de `dailyBudgets` y `storeBudgets`
- Si no hay datos nuevos, puede mostrar el presupuesto mensual como fallback

**Escritura:**
- Los componentes nuevos solo escriben en `dailyBudgets` / `storeBudgets`
- No se actualiza `budgets/{month}` en el nuevo flujo

### 4.4 Datos de ejemplo para testing

```javascript
// Script de seed para testing local
const stores = [
  { name: 'Ara', category: 'supermercado', color: '#10B981', icon: '🛒' },
  { name: 'D1', category: 'supermercado', color: '#3B82F6', icon: '🏪' },
  { name: 'Éxito', category: 'supermercado', color: '#EF4444', icon: '🏬' },
  { name: 'Olímpica', category: 'supermercado', color: '#F59E0B', icon: '🏗️' },
  { name: 'Carulla', category: 'supermercado', color: '#8B5CF6', icon: '🛍️' },
  { name: 'Makro', category: 'mayorista', color: '#EC4899', icon: '📦' },
  { name: 'Tienda del barrio', category: 'barrio', color: '#6B7280', icon: '🏠' },
]
```

---

## 5. Procedimiento de despliegue

### 5.1 Orden de despliegue

| Paso | Acción | Rollback |
|------|--------|----------|
| 1 | Crear índices Firestore (`firebase deploy --only firestore:indexes`) | Eliminar índices desde consola |
| 2 | Actualizar `firestore.rules` (`firebase deploy --only firestore:rules`) | Revertir archivo rules |
| 3 | Desplegar nueva versión de la app | Revertir commit en Cloudflare Pages |

### 5.2 Backup antes de migración

```bash
# Exportar datos actuales
firebase firestore:export ./backup-pre-rearquitectura --project mercado-inteligente-90094

# Verificar que el backup se creó
ls -la ./backup-pre-rearquitectura/
```

### 5.3 Verificación post-despliegue

1. Login funciona correctamente
2. Crear un store nuevo → aparece en la lista
3. Registrar compra con store → se guarda con storeId
4. Ver historial → compras nuevas muestran store, legacy muestra "Sin establecimiento"
5. Presupuesto diario → se guarda y se lee correctamente
6. Firestore rules → verificar que un usuario no puede leer stores de otro usuario

---

## 6. Costo estimado de Firestore

### 6.1 Operaciones por día (usuario activo)

| Operación | Lecturas | Escrituras |
|-----------|----------|------------|
| Cargar compras del día | 1 | 0 |
| Registrar 1 compra | 0 | 1 |
| Cargar presupuesto diario | 1-3 | 0 |
| Actualizar presupuesto | 0 | 1-3 |
| Listar stores | 1 | 0 |
| **Total por día** | **3-5** | **2-4** |

### 6.2 Límites del tier gratuito

| Recurso | Límite | Uso estimado/mes | Margen |
|---------|--------|-------------------|--------|
| Lecturas | 50,000/día | ~150/mes × 5 = 750 | 98.5% libre |
| Escrituras | 20,000/día | ~150/mes × 3 = 450 | 97.7% libre |
| Almacenamiento | 1 GB | ~5 MB | 99.5% libre |

**Conclusión:** El tier gratuito de Firestore es más que suficiente para esta rearquitectura.

---

**Fin del documento. Pendiente de aprobación.**
