# LOGIN_GOOGLE.md — Auditoría de Google Login

**Analistas:** Atlas, Crío, Temis
**Severidad:** CRÍTICO
**Confianza:** ALTA

---

## 1. Flujo Actual

### 1.1 Inicio del flujo (`src/services/auth.ts:49-52`)
```typescript
export async function loginWithGoogle(): Promise<void> {
  if (!auth) throw new Error('Firebase no inicializado')
  await signInWithRedirect(auth, googleProvider)
}
```
- Usa **exclusivamente** `signInWithRedirect` (NO `signInWithPopup`)
- `googleProvider` se crea sin configuración adicional (sin `setCustomParameters`)
- Proveedor: `new GoogleAuthProvider()` (`auth.ts:15`)

### 1.2 Procesamiento del redirect (`src/pages/Login.tsx:13-25`)
```typescript
useEffect(() => {
    async function checkRedirect() {
      try {
        const result = await getGoogleRedirectResult()
        if (result) {
          navigate('/')
        }
      } catch (err) {
        console.error('Error verificando redirect:', err)
      }
    }
    checkRedirect()
  }, [navigate])
```
- Se ejecuta UNA vez al montar el componente
- Si hay resultado → navega a Dashboard
- Si hay error → solo console.error, sin feedback al usuario

### 1.3 Manejo del resultado (`src/services/auth.ts:54-79`)
```typescript
export async function getGoogleRedirectResult(): Promise<User | null> {
  if (!auth || !db) return null
  try {
    const result = await getRedirectResult(auth)
    if (!result) return null
    // ... crea documento de usuario en Firestore
    return user
  } catch (error) {
    console.error('Error en redirect result:', error)
    return null  // ← ERROR SILENCIOSO
  }
}
```
- Todos los errores se tragan: `catch` logea y retorna `null`
- El usuario NUNCA ve por qué falló el login

### 1.4 Verificación de auth (`src/hooks/useAuth.ts:5-18`)
```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => { ... })
    return () => unsubscribe()
  }, [])
  return { user, loading }
}
```
- **NO hay AuthProvider context** — cada componente crea su propio listener
- `useAuth` se usa en: `ProtectedRoute`, `Dashboard`, `AddPurchase`, `BudgetPage`, `PurchaseHistory`
- 5 listeners independientes de `onAuthStateChanged`

---

## 2. Evidencia de Problemas

### 2.1 [CRÍTICO] No hay AuthProvider — race condition post-redirect

**Archivo:** `src/App.tsx:19-36` + `src/hooks/useAuth.ts:5-18`
**Evidencia:**
- `App.tsx` renderiza `<Routes>` sin ningún wrapper de contexto de auth
- `ProtectedRoute` (`src/components/ProtectedRoute.tsx:9`) llama `useAuth()` que inicializa SU PROPIO estado
- Tras el redirect de Google, `Login.tsx` procesa `getRedirectResult` y llama `navigate('/')`
- `ProtectedRoute` se monta con estado inicial `{ user: null, loading: true }`
- Si `loading` se setea a `false` ANTES de que `onAuthStateChanged` dispare, `user` es `null` → redirect a `/login` inmediato
- **Riesgo:** Bucle login → dashboard → login

### 2.2 [CRÍTICO] signInWithRedirect requiere configuración externa verificable

**Archivo:** `src/services/auth.ts:51` + `.env:2`
**Evidencia:**
- `signInWithRedirect` redirige a Google → Google redirige de vuelta al `authDomain`
- `.env` tiene `VITE_FIREBASE_AUTH_DOMAIN=mercado-inteligente-90094.firebaseapp.com`
- Para que funcione en localhost:
  1. Firebase Authentication debe estar habilitado en `mercado-inteligente-90094`
  2. Google Sign-In debe estar habilitado en Firebase Console
  3. `localhost` debe estar en Authorized Domains
  4. OAuth consent screen debe estar configurado en Google Cloud Console
- **Ninguno de estos requisitos es verificable desde el código**
- El build TypeScript compila, pero en runtime puede fallar con:
  - `auth/unauthorized-domain`
  - `auth/configuration-not-found`
  - `auth/operation-not-allowed`
  - `auth/invalid-api-key`

### 2.3 [ALTO] Errores silenciosos sin feedback al usuario

**Archivo:** `src/services/auth.ts:75-78`, `src/pages/Login.tsx:20-22`
**Evidencia:**
```typescript
// auth.ts:75-78
catch (error) {
    console.error('Error en redirect result:', error)
    return null
}

// Login.tsx:20-22
catch (err) {
    console.error('Error verificando redirect:', err)
}
```
- `getGoogleRedirectResult` retorna `null` en cualquier error
- `Login.tsx` no diferencia entre "no hay redirect pendiente" y "error de configuración"
- Si Firebase Auth no está habilitado, el usuario solo ve una pantalla de login sin ningún mensaje

### 2.4 [ALTO] Función loginWithEmail sin verificar db inicializado

**Archivo:** `src/services/auth.ts:42-47`
**Evidencia:**
```typescript
export async function loginWithEmail(email: string, password: string): Promise<FirebaseUser> {
  if (!auth) throw new Error('Firebase no inicializado')
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}
```
- Solo verifica `auth`, no verifica `db` 
- Si `db` es null y se intenta usar después, falla

### 2.5 [MEDIO] registerWithEmail crea documento user sin verificar `isConfigValid`

**Archivo:** `src/services/auth.ts:21-40`
**Evidencia:**
```typescript
export async function registerWithEmail(email: string, password: string): Promise<User> {
  if (!auth || !db) throw new Error('Firebase no inicializado')
  // ... crea auth user
  await setDoc(doc(db, 'users', firebaseUser.uid), { ... })
  return user
}
```
Verifica auth y db, pero no verifica isConfigValid. Si Firebase está parcialmente inicializado, puede fallar después del registro de auth.

---

## 3. Evaluación de Errores Firebase Potenciales

| Error | Probabilidad | Dónde se atrapa | Feedback al usuario |
|-------|-------------|-----------------|-------------------|
| auth/unauthorized-domain | ALTA (localhost) | `getGoogleRedirectResult` catch | ❌ Ninguno |
| auth/configuration-not-found | MEDIA | `getGoogleRedirectResult` catch | ❌ Ninguno |
| auth/popup-blocked | BAJA (usa redirect, no popup) | N/A | N/A |
| auth/internal-error | MEDIA | `getGoogleRedirectResult` catch | ❌ Ninguno |
| auth/network-request-failed | BAJA | `getGoogleRedirectResult` catch | ❌ Ninguno |
| auth/invalid-api-key | MEDIA (si .env mal) | `getGoogleRedirectResult` catch | ❌ Ninguno |
| auth/operation-not-allowed | ALTA (si Google Sign-In no habilitado) | `getGoogleRedirectResult` catch | ❌ Ninguno |

---

## 4. Conclusión

**Causa raíz primaria:** La configuración de Firebase Authentication para Google Sign-In no puede verificarse desde el código. El proyecto asume que el backend Firebase existe y está configurado, pero no hay forma de confirmarlo sin acceso a Firebase Console.

**Causa raíz secundaria:** La arquitectura de autenticación carece de un AuthProvider context, lo que causa:
1. Listeners duplicados de `onAuthStateChanged` (5 instancias)
2. Posibles race conditions en la propagación del estado post-redirect
3. Sin un solo source of truth para el estado de auth

**Causa raíz terciaria:** Errores silenciosos — el catch de `getGoogleRedirectResult` oculta todos los errores al usuario, haciendo imposible diagnosticar desde el frontend.

---

## 5. Archivos Afectados

| Archivo | Líneas | Problema |
|---------|--------|----------|
| `src/services/auth.ts` | 49-52, 54-79 | signInWithRedirect + errores silenciosos |
| `src/pages/Login.tsx` | 13-25, 61-69 | useEffect sin feedback + catch genérico |
| `src/hooks/useAuth.ts` | 5-18 | Sin AuthProvider, listener independiente |
| `src/config/firebase.ts` | 22-26 | auth puede ser null |
| `src/App.tsx` | 17-37 | Sin AuthProvider wrapper |
| `.env` | 1-7 | Credenciales no verificables |
| `src/components/ProtectedRoute.tsx` | 9, 19-20 | Depende de useAuth sin provider |

---

**Fin de LOGIN_GOOGLE.md**
