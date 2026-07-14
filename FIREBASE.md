# FIREBASE.md — Auditoría de Firebase

**Analistas:** Prometeo, Crío
**Severidad:** ALTO
**Confianza:** MUY ALTA

---

## 1. Configuración General

### 1.1 Inicialización (`src/config/firebase.ts`)
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
}

const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId
const app = isConfigValid ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const storage = app ? getStorage(app) : null
```

### 1.2 Variables de entorno (`.env`)
```
VITE_FIREBASE_API_KEY=AIzaSyA5-4C4urcXGWitjGjKOi9aTneiMBf4WCk
VITE_FIREBASE_AUTH_DOMAIN=mercado-inteligente-90094.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mercado-inteligente-90094
VITE_FIREBASE_STORAGE_BUCKET=mercado-inteligente-90094.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=584532170160
VITE_FIREBASE_APP_ID=1:584532170160:web:ad69c5f747c46bd4027275
VITE_FIREBASE_MEASUREMENT_ID=G-BMXR11KV6Q
```

### 1.3 Emuladores (`src/config/firebase.ts:31-47`)
```typescript
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'
if (useEmulator) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, 'localhost', 8080)
}
```
- Controlado por `.env.local`: `VITE_USE_FIREBASE_EMULATOR=false`
- **Emuladores desactivados** — la app apunta al proyecto Firebase real

---

## 2. Firebase Authentication

### 2.1 Estado actual
- **Método:** `signInWithRedirect` (exclusivamente)
- **Proveedores:** Google (vía `GoogleAuthProvider`) y Email/Password
- **authDomain:** `mercado-inteligente-90094.firebaseapp.com`
- **Emulador:** Desactivado

### 2.2 Problemas identificados

#### [CRÍTICO] Proyecto Firebase no verificable
**Evidencia:** `.env:3` → `VITE_FIREBASE_PROJECT_ID=mercado-inteligente-90094`
**Impacto:** No podemos verificar desde el código que el proyecto Firebase:
- Existe realmente en la consola de Firebase
- Tiene Authentication habilitado
- Tiene Google Sign-In como proveedor habilitado
- Tiene `localhost` y el dominio de producción en Authorized Domains
- Tiene el OAuth Client ID configurado en Google Cloud Console

#### [ALTO] Validación insuficiente de configuración
**Archivo:** `src/config/firebase.ts:16-20`
```typescript
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId
if (!isConfigValid) {
  console.error('Firebase config incompleta...')
}
```
- Solo verifica que `apiKey` y `projectId` NO sean empty strings
- No verifica formato de API key (debería empezar con `AIzaSy`)
- No verifica que el proyecto realmente exista
- No verifica otros campos como `authDomain`

#### [ALTO] auth, db, storage pueden ser null
**Archivo:** `src/config/firebase.ts:22-26`
```typescript
const app = isConfigValid ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const storage = app ? getStorage(app) : null
```
- Si `apiKey` o `projectId` están vacíos, todo es `null`
- Los servicios chequean esto individualmente, pero algunos retornan valores default silenciosos:
  - `purchases.ts:48` → `return []`
  - `budget.ts:16` → `return null`
  - `storage.ts:32` → `throw new Error('Storage no inicializado')` (correcto)
  - `auth.ts:50` → `throw new Error('Firebase no inicializado')` (correcto)

---

## 3. Firestore

### 3.1 Estructura de colecciones
```
/users/{userId}
  → Documento de usuario
  /budgets/{month}
    → Presupuesto mensual
  /purchases/{purchaseId}
    → Compras registradas
```

### 3.2 Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isOwner(userId) { return request.auth.uid == userId; }
    
    match /users/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
      
      match /budgets/{budgetId} {
        allow read, write: if isAuthenticated() && isOwner(userId);
      }
      match /purchases/{purchaseId} {
        allow read, write: if isAuthenticated() && isOwner(userId);
      }
    }
  }
}
```

### 3.3 Problemas identificados

#### [MEDIO] Sin índices compuestos
**Archivo:** `firestore.indexes.json:2`
```json
{
  "indexes": [],
  "fieldOverrides": []
}
```
- No hay índices definidos
- Las queries en `purchases.ts:57-62` usan `where('createdAt', '>=', ...)` + `where('createdAt', '<=', ...)` + `orderBy('createdAt', 'desc')`
- Para queries con WHERE y ORDER BY en el MISMO campo, Firestore usa el índice automático de campo único
- **Conclusión:** No hay problema de índices PARA ESTA QUERY. Pero si se agregaran filtros adicionales (ej: `where('userId', ...)`) se necesitaría un índice compuesto.

#### [BAJO] Reglas no deployadas
**Evidencia:** `firebase.json:3` → `"rules": "firestore.rules"`
- Las reglas están definidas localmente
- `firebase.json` tiene sección `hosting` para deploy a Firebase Hosting
- Pero según `STACK.md:46`: "la sección hosting ya no se usa para deploy" (migrado a Cloudflare Pages)
- **Riesgo:** Si las reglas no se deployaron a Firestore, las reglas por defecto DENY ALL bloquean todo
- **Las reglas deben deployarse explícitamente:** `firebase deploy --only firestore:rules`

---

## 4. Firebase Storage

### 4.1 Configuración (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4.2 Storage Bucket
**Evidencia:** `.env:4` → `VITE_FIREBASE_STORAGE_BUCKET=mercado-inteligente-90094.firebasestorage.app`
- Formato correcto para proyectos Firebase configurados con ubicación `nam5` (us-central)
- Si el proyecto usara la bucket default, sería `mercado-inteligente-90094.appspot.com`

### 4.3 Problema identificado

#### [BAJO] Imagen de prueba de storage falla silenciosamente
**Archivo:** `src/hooks/useOCR.ts:35-40`
```typescript
try {
  uploadedUrl = await uploadReceiptImage(userId, file, purchaseId)
  setImageUrl(uploadedUrl)
} catch (e) {
  console.error('Storage upload failed:', e)
}
```
- Si Storage falla (ej: bucket no existe), el error se logea pero OCR continúa
- El usuario recibe los items parseados pero sin imagen
- No es bloqueante para el registro de productos

---

## 5. Firebase JSON Configuration

### 5.1 firebase.json
```json
{
  "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
  "hosting": { "public": "dist", "rewrites": [{ "source": "**", "destination": "/index.html" }] },
  "storage": { "rules": "storage.rules" },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8085 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### 5.2 Problemas

#### [MEDIO] Puerto de emulador Firestore inconsistente
- `firebase.json:27`: `"firestore": { "port": 8085 }`
- `src/config/firebase.ts:39`: `connectFirestoreEmulator(db, 'localhost', 8080)`
- **Puertos diferentes** (8085 vs 8080)
- Si se activa el emulador, la conexión fallaría porque el código intenta conectar al puerto 8080 pero el emulador corre en 8085

#### [BAJO] Sección hosting obsoleta
- `STACK.md:46`: hosting migrado a Cloudflare Pages
- `firebase.json` aún tiene sección `hosting` que ya no se usa
- No causa problemas, pero es código muerto

---

## 6. Resumen de Problemas Firebase

| # | Problema | Componente | Severidad | Evidencia |
|---|----------|-----------|-----------|-----------|
| 1 | Proyecto Firebase no verificable | Auth | CRÍTICO | `.env:3` |
| 2 | Validación insuficiente de config | Config | ALTO | `firebase.ts:16-20` |
| 3 | auth/db/storage pueden ser null | Config | ALTO | `firebase.ts:22-26` |
| 4 | Reglas Firestore posiblemente no deployadas | Firestore | ALTO | `firebase.json:3` + `STACK.md:46` |
| 5 | Sin índices compuestos (no crítico hoy) | Firestore | MEDIO | `firestore.indexes.json:2` |
| 6 | Puerto emulador inconsistente (8080 vs 8085) | Emuladores | MEDIO | `firebase.json:27` vs `firebase.ts:39` |
| 7 | Storage falla silenciosamente en OCR | Storage | BAJO | `useOCR.ts:35-40` |
| 8 | Sección hosting obsoleta en firebase.json | Config | BAJO | `firebase.json:6-19` + `STACK.md:46` |

---

**Fin de FIREBASE.md**
