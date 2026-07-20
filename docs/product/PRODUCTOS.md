# PRODUCTOS.md — Auditoría de Registro de Productos

**Analista:** Prometeo
**Severidad:** CRÍTICO (dependencia de auth) / ALTO (arquitectura)
**Confianza:** MUY ALTA

---

## 1. Flujo Actual

```
AddPurchase.tsx
  ├── Manual: handleSubmit → addPurchase(user.uid, validItems)
  ├── OCR: handleImageSelected → useOCR.processTicket → OCRReview → addPurchase
  └── Voice: VoiceCapture → useVoice → OCRReview → addPurchase
        ↓
purchases.ts:addPurchase(userId, items, receiptImageUrl?)
        ↓
Firestore: collection(db, 'users', userId, 'purchases')
        ↓
addDoc → doc auto-generado
```

### 1.1 addPurchase (`src/services/purchases.ts:17-45`)
```typescript
export async function addPurchase(userId: string, items: PurchaseItem[], receiptImageUrl?: string) {
  if (!db) throw new Error('Firebase no inicializado')
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const purchaseData = { userId, items, total, receiptImageUrl, createdAt: serverTimestamp() }
  const purchasesRef = collection(db, 'users', userId, 'purchases')
  const docRef = await addDoc(purchasesRef, purchaseData)
  return { id: docRef.id, userId, items, total, receiptImageUrl, createdAt: new Date() }
}
```

### 1.2 Manual submit (`src/pages/AddPurchase.tsx:55-77`)
```typescript
async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return  // ← SILENT FAILURE si user es null
    const validItems = items.filter(item => item.name.trim() && item.quantity > 0 && item.unitPrice > 0)
    if (validItems.length === 0) {
      setMessage('Agregá al menos un producto válido')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      await addPurchase(user.uid, validItems)
      setItems([{ name: '', quantity: 1, unitPrice: 0, totalPrice: 0 }])
      setMessage('Compra registrada correctamente')
    } catch (err) {
      setMessage('Error al registrar la compra')
    } finally { setSaving(false) }
  }
```

---

## 2. Evidencia de Problemas

### 2.1 [CRÍTICO] Dependencia total de autenticación

**Archivo:** `src/pages/AddPurchase.tsx:11`
**Evidencia:**
```typescript
const { user } = useAuth()
```
- `AddPurchase` depende de `useAuth()` que retorna `{ user, loading }`
- Si `user` es `null` (no autenticado):
  - `handleSubmit` retorna silenciosamente en línea 57: `if (!user) return`
  - `useOCR(user?.uid ?? null)` recibe `null` → `processTicket` falla con "No hay usuario autenticado" (`useOCR.ts:19-23`)
  - `handleGoogleLogin` nunca se ejecuta porque ProtectedRoute ya bloqueó el acceso
- **Dependencia:** Google Login funcional es PRERREQUISITO para registrar productos

### 2.2 [ALTO] Sin refresco automático del Dashboard

**Archivo:** `src/pages/AddPurchase.tsx:69`, `src/pages/Dashboard.tsx:27-62`
**Evidencia:**
- `addPurchase` en Firestore no emite eventos
- Dashboard carga datos en `useEffect` con dependencias `[user, selectedMonth, budgetVersion]`
- `budgetVersion` cambia cuando se guarda presupuesto (`BudgetPage.onSaved`)
- **No hay** mecanismo para refrescar las compras después de `addPurchase`
- El usuario debe recargar la página para ver la nueva compra en Dashboard
- PurchaseHistory tampoco se refresca — no hay dependencia que cambie

### 2.3 [ALTO] addPurchase no retorna datos de serverTimestamp

**Archivo:** `src/services/purchases.ts:37-44`
**Evidencia:**
```typescript
return {
    id: docRef.id,
    userId,
    items,
    total,
    receiptImageUrl,
    createdAt: new Date(),  // ← FECHA LOCAL, no serverTimestamp
  }
```
- `createdAt` se retorna como `new Date()` (hora local del cliente)
- El dato REAL en Firestore es `serverTimestamp()`
- En `getPurchases`, se usa `data.createdAt?.toDate()` que SÍ es el serverTimestamp
- **Inconsistencia:** El objeto retornado por `addPurchase` tiene una fecha diferente a la que se lee después

### 2.4 [MEDIO] addPurchase ignora receiptImageUrl en modo manual

**Archivo:** `src/pages/AddPurchase.tsx:69`
**Evidencia:**
```typescript
await addPurchase(user.uid, validItems)  // Sin receiptImageUrl
```
- Solo OCRReview pasa `receiptImageUrl`: `addPurchase(userId, items, imageUrl ?? undefined)` (`OCRReview.tsx:47`)
- Modo manual nunca asocia imagen
- No es un bloqueador, pero es una funcionalidad incompleta

### 2.5 [MEDIO] PurchaseHistory — loadPurchases definida dos veces

**Archivo:** `src/pages/PurchaseHistory.tsx:136-148`
**Evidencia:**
```typescript
  // ... (código anterior con return)
  
  async function loadPurchases() {  // ← SEGUNDA DEFINICIÓN después del return
    if (!user) return
    // ...
  }
```
- La función `loadPurchases` se define primero dentro del componente (usada en `useEffect`)
- Se redefine al final del archivo (fuera del flujo principal)
- La segunda definición es un hoisting issue: puede causar confusión pero JavaScript permite el llamado desde el JSX (línea 74)
- **Bug potencial:** La referencia `loadPurchases` en el error state (línea 74) llama a la SEGUNDA definición, no a la del useEffect

### 2.6 [BAJO] UnitPrice step=10 puede causar redondeo inesperado

**Archivo:** `src/pages/AddPurchase.tsx:241`
**Evidencia:**
```html
step="10"
```
- HTML nativo valida que los valores sean múltiplos de 10
- Si el usuario escribe 25, el navegador redondea a 20 o 30
- Precios como $25.50 no son posibles sin JS adicional

### 2.7 [BAJO] Sin validación de total > 0

**Archivo:** `src/pages/AddPurchase.tsx:59`
**Evidencia:**
```typescript
const validItems = items.filter(item => item.name.trim() && item.quantity > 0 && item.unitPrice > 0)
```
- Valida `item.name`, `item.quantity`, `item.unitPrice`
- Pero no valida `item.totalPrice > 0`

---

## 3. Análisis de Humo del Flujo Completo

```
  [Usuario NO autenticado]
         ↓
  ProtectedRoute → user=null → redirect a /login
         ↓
  [NUNCA alcanza AddPurchase]
         ↓
  ✗ BLOQUEADO

  [Usuario autenticado OK]
         ↓
  AddPurchase montado
         ↓
  ¿user?.uid existe? → user proviene de useAuth()
         ↓
  ¡SÍ! → handleSubmit → addPurchase(user.uid, validItems)
         ↓
  purchasesRef = collection(db, 'users', userId, 'purchases')
         ↓
  ¿userId coincide con request.auth.uid en Firestore Rules?
         ↓
  ¡SÍ! (userId = user.uid) → addDoc exitoso
         ↓
  Documento creado en Firestore
         ↓
  Retorna a AddPurchase con mensaje "Compra registrada correctamente"
         ↓
  Dashboard NO se refresca (no hay evento/pub-sub)
         ↓
  PurchaseHistory NO se refresca
```

**Conclusión del análisis de humo:** Si el usuario está autenticado correctamente, el flujo técnico de `addPurchase` funciona. El problema real es: el usuario NUNCA llega a AddPurchase porque Google Login no funciona.

---

## 4. Causa Raíz

**Causa raíz primaria:** El registro de productos depende 100% de la autenticación. Si Google Login no funciona (Fase 1), el usuario nunca puede registrar productos.

**Causa raíz secundaria:** Incluso con auth funcional, no hay invalidación de caché entre `addPurchase` y el Dashboard. Las compras nuevas no aparecen hasta recargar la página.

---

## 5. Archivos Afectados

| Archivo | Líneas | Problema |
|---------|--------|----------|
| `src/pages/AddPurchase.tsx` | 11, 57, 69, 241 | Dependencia auth, sin receiptUrl manual, step=10 |
| `src/services/purchases.ts` | 37-44, 48 | createdAt local, return [] silencioso |
| `src/pages/Dashboard.tsx` | 27-62 | Sin refresco post-addPurchase |
| `src/pages/PurchaseHistory.tsx` | 72-74, 136-148 | loadPurchases duplicada |
| `src/hooks/useOCR.ts` | 19-23 | Fallo si userId es null |
| `src/services/budget.ts` | 16 | return null silencioso |

---

**Fin de PRODUCTOS.md**
