# BUILD.md — Auditoría de Build y Calidad de Código

**Analista:** Temis
**Severidad:** BAJO (build) / MEDIO (calidad de código)
**Confianza:** ALTA

---

## 1. Build

### 1.1 Estado del Build
Build validado (pre-ejecutado):

```
✓ TypeScript compiló correctamente
✓ Vite build completado correctamente
✓ PWA generada correctamente
✓ Sin errores de compilación
```

### 1.2 Advertencias
```
Some chunks are larger than 500 kB after minification
```
- **No es causa raíz** de los problemas reportados
- Posiblemente causado por Recharts o Tesseract.js
- Se puede optimizar con code splitting adicional

---

## 2. Tests

### 2.1 Archivos de test encontrados (21 tests)
```
src/
  pages/
    Dashboard.test.tsx
    AddPurchase.test.tsx
  hooks/
    useVoice.test.ts
    useOCR.test.ts
  services/
    voiceParser.test.ts
    voice.test.ts
    ticketParser.test.ts
    storage.test.ts
    purchases.test.ts
    ocr.test.ts
    budget.test.ts
    auth.test.ts
    analytics.test.ts
  components/
    VoiceCapture.test.tsx
    ProductEditor.test.tsx
    OCRReview.test.tsx
    OCRCapture.test.tsx
    MonthNavigator.test.tsx
    ChartsSection.test.tsx
    ChartsContent.test.tsx
  pwa.test.ts
```

### 2.2 Problemas con tests

#### [MEDIO] Tests pueden estar desactualizados o mockear Firebase
- `src/services/auth.test.ts` — probablemente mockea Firebase Auth
- Los tests unitarios no pueden verificar la conexión real con Firebase
- No hay tests de integración que prueben el flujo real contra Firebase o emuladores
- `tasks.md:50` menciona "Tests de integración — flujo completo" como aprobada, pero no hay evidencia de tests e2e

---

## 3. Calidad de Código

### 3.1 TypeScript Config (`tsconfig.json`)
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noUncheckedIndexedAccess": true,
  "noFallthroughCasesInSwitch": true
}
```
- ✅ Strict mode habilitado
- ✅ Variables locales no usadas = error
- ✅ Parámetros no usados = error
- ✅ Index access no verificado = error
- Build compila → no hay errores de tipos

### 3.2 ESLint
- Configuración: `eslint.config.js`
- Comando: `npm run lint` (se ejecuta pero timeout a 60s)
- No se pudo obtener resultado completo por timeout

### 3.3 Imports (`@/` alias)
- Configurado en `vite.config.ts:53-55` y `tsconfig.json:20-22`
- ✅ `@/` resuelve a `./src/*`
- ✅ Todos los componentes importan correctamente con `@/` alias

### 3.4 Código muerto o duplicado

#### [MEDIO] Directorio duplicado `MercadoInteligente/`
**Evidencia:** Directorio completo en la raíz, con su propio `node_modules/`, `.git/`, `package.json`
**Impacto:** Puede causar confusión sobre cuál es el proyecto real
**Probable origen:** Se creó el proyecto en `MercadoInteligente/` y luego se movió a la raíz

#### [MEDIO] PurchaseHistory.loadPurchases duplicada
**Archivo:** `src/pages/PurchaseHistory.tsx:136-148`
**Evidencia:** La función se define dentro del componente (usada en useEffect) y se redefine al final del archivo
**Impacto:** La referencia en el JSX (línea 74) puede llamar a la definición incorrecta

#### [BAJO] Sección hosting en firebase.json no usada
**Evidencia:** `firebase.json:6-19` + `STACK.md:46`

### 3.5 Componentes huérfanos
- ✅ Todos los componentes en `src/components/` son importados por al menos una página
- ✅ Todas las páginas en `src/pages/` son referenciadas en `src/App.tsx` (via lazy import)
- ✅ Todos los servicios en `src/services/` son importados por hooks o páginas

### 3.6 Hooks

#### useAuth (`src/hooks/useAuth.ts`)
- Sin dependencias externas de contexto
- Cada invocación crea un listener independiente
- No hay memoization del listener

#### useOCR (`src/hooks/useOCR.ts`)
- Dependencia: `userId` (string | null)
- Si userId es null, muestra error "No hay usuario autenticado"
- ✅ Manejo correcto de estados (idle, uploading, ocr-running, parsing, done, error)

#### useVoice (`src/hooks/useVoice.ts`)
- ✅ Manejo correcto de estados
- ✅ Uso de refs para evitar closures obsoletas (transcriptRef, statusRef, stopRef)

#### usePWAInstall (`src/hooks/usePWAInstall.tsx`)
- ✅ Manejo correcto del evento `beforeinstallprompt`
- ✅ Cleanup de event listeners

### 3.7 Errores silenciosos identificados

| Archivo | Línea | Error | Impacto |
|---------|-------|-------|---------|
| `src/services/auth.ts` | 75-78 | getGoogleRedirectResult catch return null | Usuario no ve error de login |
| `src/services/purchases.ts` | 48 | `if (!db || !isConfigValid) return []` | Dashboard muestra "sin compras" en vez de error |
| `src/services/budget.ts` | 16 | `if (!db || !isConfigValid) return null` | Dashboard muestra "sin presupuesto" en vez de error |
| `src/pages/Login.tsx` | 20-22 | getGoogleRedirectResult catch solo console.error | Usuario no sabe que falló |
| `src/pages/AddPurchase.tsx` | 57 | `if (!user) return` | Submit no hace nada, sin feedback |
| `src/hooks/useOCR.ts` | 35-40 | Storage upload catch solo console.error | Usuario no sabe que la imagen no se subió |

---

## 4. Análisis de Dependencias

| Dependencia | Versión | Estado |
|------------|---------|--------|
| react | ^18.3.1 | ✅ |
| react-dom | ^18.3.1 | ✅ |
| react-router-dom | ^6.28.0 | ✅ |
| firebase | ^11.0.0 | ⚠️ Versión reciente (nov 2024), signInWithRedirect cambió en v10+ |
| recharts | ^3.9.2 | ✅ |
| tesseract.js | ^5.1.1 | ✅ |
| vite | ^6.0.0 | ✅ |
| vitest | ^2.1.5 | ✅ |
| typescript | ~5.6.2 | ✅ |

**Riesgo:** `firebase ^11.0.0` es la versión más reciente. El comportamiento de `signInWithRedirect` cambió significativamente en Firebase Auth v10+. Es posible que la implementación actual no sea compatible con la versión instalada, aunque el build compila sin errores.

---

## 5. Resumen

| Aspecto | Estado | Observaciones |
|---------|--------|---------------|
| Build TypeScript | ✅ | Compila sin errores |
| Build Vite | ✅ | Build completo |
| PWA | ✅ | Service worker generado |
| Tests | ⚠️ | 21 archivos de test, no ejecutados por timeout |
| ESLint | ⚠️ | Timeout en ejecución |
| Strict TS | ✅ | strict mode, noUnusedLocals, noUncheckedIndexedAccess |
| Imports | ✅ | Todos los alias @/ funcionan |
| Código muerto | ⚠️ | Directorio MercadoInteligente/ duplicado |
| Componentes huérfanos | ✅ | Todos referenciados |
| Errores silenciosos | ❌ | 6+ instancias de errores no reportados al usuario |

---

**Fin de BUILD.md**
