# AUDITORÍA — Mercado Inteligente

**Fecha:** 2026-07-13
**Auditor:** Cronos (Agencia Los Titanes)
**Participantes:** Atlas, Prometeo, Hefesto, Temis, Crío
**Estado:** COMPLETADA (solo diagnóstico, sin modificaciones)

---

## Resumen Ejecutivo

Se identificaron **14 hallazgos** (4 CRÍTICOS, 4 ALTOS, 3 MEDIOS, 3 BAJOS).

Los tres problemas reportados (Google Login, registro de productos, flujo bloqueado) comparten una **causa raíz común**: la configuración de Firebase Authentication.

---

## Tabla Resumen

| Problema | Causa Raíz | Archivo | Severidad | Confianza |
|----------|-----------|---------|-----------|-----------|
| Google Login falla | signInWithRedirect requiere authDomain válido + Google Sign-In habilitado + dominios autorizados en Firebase Console. Ninguno de estos requisitos es verificable desde el código. | `.env` + `src/services/auth.ts:51` + Firebase Console | CRÍTICO | ALTA |
| Google Login falla | No hay AuthProvider context — cada componente crea su propio listener onAuthStateChanged, causando race conditions post-redirect. | `src/hooks/useAuth.ts` + `src/App.tsx` | CRÍTICO | ALTA |
| Google Login falla | Errores silenciosos en `getGoogleRedirectResult` — catch return null sin feedback al usuario. | `src/services/auth.ts:75-78`, `src/pages/Login.tsx:20-22` | ALTO | ALTA |
| No se registran productos | Dependencia de autenticación: si el usuario no puede autenticarse, ProtectedRoute bloquea todo el flujo. | `src/components/ProtectedRoute.tsx:19-20` | CRÍTICO | MUY ALTA |
| No se registran productos | addPurchase no refresca Dashboard automáticamente — no hay invalidación de caché. | `src/pages/AddPurchase.tsx:69` + `src/pages/Dashboard.tsx:27-62` | ALTO | ALTA |
| No se registran productos | addPurchase ignora receiptImageUrl en modo manual. | `src/pages/AddPurchase.tsx:69` | BAJO | ALTA |
| Flujo bloqueado | ProtectedRoute usa `useAuth()` sin AuthProvider — estado no compartido, posible bounce login→dashboard→login. | `src/components/ProtectedRoute.tsx:9` + `src/hooks/useAuth.ts:6-7` | CRÍTICO | ALTA |
| Firebase no inicializado | `auth` puede ser null si env vars fallan en runtime — las funciones chequean !auth pero retornan valores default silenciosos. | `src/config/firebase.ts:22-26`, `src/services/purchases.ts:48`, `src/services/budget.ts:16` | ALTO | MUY ALTA |
| Proyecto duplicado | Directorio `MercadoInteligente/` es copia completa del proyecto raíz. | `MercadoInteligente/` | MEDIO | MUY ALTA |
| PurchaseHistory bug | Función loadPurchases definida dos veces (segunda después del return). | `src/pages/PurchaseHistory.tsx:136-148` | MEDIO | ALTA |
| Chunk grande | Bundle >500 kB tras minificación (advertencia de build). | `vite.config.ts` | BAJO | ALTA |
| Sin índices compuestos | firestore.indexes.json vacío. | `firestore.indexes.json:2` | MEDIO | ALTA |
| Variables env duplicadas | `.env.local` solo tiene USE_EMULATOR=false — configuración Firebase está en `.env` que no está en git. | `.env` vs `.env.local` | BAJO | ALTA |
| Login-Page no chequea redirect error | useEffect en Login.tsx no muestra errores al usuario si getGoogleRedirectResult falla. | `src/pages/Login.tsx:13-25` | ALTO | ALTA |

---

## Mapa de Arquitectura

```
src/main.tsx
  └── <App /> (BrowserRouter, sin AuthProvider)
        ├── /login      → <Login />  (useEffect → getGoogleRedirectResult)
        ├── /register   → <Register />
        ├── /           → <ProtectedRoute>  (useAuth propio)
        │                  └── <Dashboard />
        │                        ├── <MonthNavigator />
        │                        ├── <BudgetPage />    (useAuth propio)
        │                        ├── <AddPurchase />   (useAuth propio)
        │                        │     ├── <OCRCapture />
        │                        │     ├── <OCRReview /> → <ProductEditor />
        │                        │     └── <VoiceCapture />
        │                        ├── <PurchaseHistory /> (useAuth propio)
        │                        └── <ChartsSection />
        │                              └── <ChartsContent /> (analytics)
        └── *           → Navigate to /
```

**Problema estructural:** No hay AuthProvider. Cada componente que necesita auth inicializa su propio `onAuthStateChanged`. Esto crea N listeners independientes donde 1 alcanza.

---

## Dependencias Críticas (package.json)

| Dependencia | Versión | Propósito |
|------------|---------|-----------|
| firebase | ^11.0.0 | Auth, Firestore, Storage |
| react | ^18.3.1 | UI |
| react-router-dom | ^6.28.0 | Routing |
| recharts | ^3.9.2 | Gráficos Dashboard |
| tesseract.js | ^5.1.1 | OCR de tickets |

---

## Flujo de Autenticación Actual

```
Usuario click "Google"
  ↓
handleGoogleLogin() → loginWithGoogle()
  ↓
signInWithRedirect(auth, googleProvider)
  ↓  [redirect a Google, luego redirect de vuelta]
Página recarga → Login.tsx se monta
  ↓
useEffect → getGoogleRedirectResult()
  ↓  [si success]
navigate('/')
  ↓
ProtectedRoute → useAuth() → onAuthStateChanged
  ↓  [si user != null]
<Dashboard /> se renderiza
```

**Punto de falla crítico:** `signInWithRedirect` redirige al navegador fuera de la app. Firebase necesita:
1. Que el authDomain sea accesible
2. Google Sign-In habilitado en Firebase Console
3. El dominio actual en Authorized Domains
4. OAuth Client ID configurado en Google Cloud Console

Si cualquiera falla, el usuario nunca vuelve autenticado.

---

## Análisis de Causa Raíz

### Problema 1: Google Login no funciona
**Causa raíz:** Configuración de Firebase Authentication no verificable. El proyecto usa `signInWithRedirect` con el authDomain `mercado-inteligente-90094.firebaseapp.com` (`.env:2`). No podemos verificar desde el código si:
- El proyecto Firebase `mercado-inteligente-90094` existe
- Google Sign-In está habilitado
- `localhost` está en authorized domains
- El OAuth client ID está configurado

**Causa secundaria:** No hay AuthProvider, cada componente tiene su propio listener `onAuthStateChanged`. `src/hooks/useAuth.ts:6-16`, `src/App.tsx:19-36`.

### Problema 2: No se registran productos
**Causa raíz:** Dependencia total de autenticación. Si Google Login no funciona, el usuario nunca llega a `AddPurchase`. `src/components/ProtectedRoute.tsx:19-20` redirige a `/login` si `!user`.

**Causa secundaria:** Incluso con auth funcional, errores en `addPurchase` son silenciosos. `src/pages/AddPurchase.tsx:72-73`.

### Problema 3: Flujo bloqueado
**Causa raíz:** `ProtectedRoute` bloquea toda la app si el usuario no está autenticado. Es el diseño correcto, pero magnifica el problema de auth: si auth falla, NADIE puede usar la app.

---

## Archivos Analizados (28)

- src/config/firebase.ts
- src/services/auth.ts (+ auth.test.ts)
- src/services/purchases.ts (+ purchases.test.ts)
- src/services/budget.ts (+ budget.test.ts)
- src/services/storage.ts (+ storage.test.ts)
- src/services/ocr.ts (+ ocr.test.ts)
- src/services/ticketParser.ts (+ ticketParser.test.ts)
- src/services/voice.ts (+ voice.test.ts)
- src/services/voiceParser.ts (+ voiceParser.test.ts)
- src/services/analytics.ts (+ analytics.test.ts)
- src/hooks/useAuth.ts
- src/hooks/useOCR.ts (+ useOCR.test.ts)
- src/hooks/useVoice.ts (+ useVoice.test.ts)
- src/hooks/usePWAInstall.tsx
- src/pages/Login.tsx
- src/pages/Register.tsx
- src/pages/Dashboard.tsx (+ Dashboard.test.tsx)
- src/pages/AddPurchase.tsx (+ AddPurchase.test.tsx)
- src/pages/Budget.tsx
- src/pages/PurchaseHistory.tsx
- src/components/ProtectedRoute.tsx
- src/components/OCRCapture.tsx (+ OCRCapture.test.tsx)
- src/components/OCRReview.tsx (+ OCRReview.test.tsx)
- src/components/ProductEditor.tsx (+ ProductEditor.test.tsx)
- src/components/VoiceCapture.tsx (+ VoiceCapture.test.tsx)
- src/components/MonthNavigator.tsx (+ MonthNavigator.test.tsx)
- src/components/ChartsSection.tsx (+ ChartsSection.test.tsx)
- src/components/ChartsContent.tsx (+ ChartsContent.test.tsx)
- src/App.tsx, src/main.tsx
- src/types/index.ts
- src/utils/date.ts
- .env, .env.local, .env.example
- firestore.rules, storage.rules, firebase.json, firestore.indexes.json
- vite.config.ts, vitest.config.ts, tsconfig.json, package.json, .gitignore
- STACK.md, tasks.md

---

**Fin del informe consolidado.** Auditoría completa sin modificaciones.
