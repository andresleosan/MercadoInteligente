# MEJORAS — Mercado Inteligente

**Fecha:** 2026-07-16
**Origen:** Auditoría AUDITORIA.md (2026-07-13)
**Estado:** COMPLETADA

---

## Resumen

14 hallazgos de auditoría traducidos en **8 mejoras concretas**, priorizadas por severidad y dependencias.

---

## Mejoras Priorizadas

### M-01: Implementar AuthProvider global (CRÍTICO)
**Hallazgos:** #1, #2, #4, #7 (CRÍTICOS)
**Problema:** No existe un AuthProvider. Cada componente crea su propio `onAuthStateChanged`, causando N listeners independientes, race conditions post-redirect, y estado no compartido.
**Archivo afectado:** `src/App.tsx`, `src/hooks/useAuth.ts`, todos los componentes que usan `useAuth()`

**Acción:**
1. Crear `src/providers/AuthProvider.tsx` con contexto global de autenticación
2. Envolver la app en `<AuthProvider>` en `src/main.tsx` o `src/App.tsx`
3. Modificar `useAuth()` para consumir el contexto en vez de crear su propio listener
4. Verificar que `ProtectedRoute` funcione con el AuthProvider

**Dependiente de:** Ninguna
**Esfuerzo estimado:** Medio (2-3 horas)

---

### M-02: Corregir configuración de Firebase Auth (CRÍTICO)
**Hallazgos:** #1, #4 (CRÍTICOS)
**Problema:** `signInWithRedirect` requiere configuración específica en Firebase Console que no es verificable desde el código.
**Archivo afectado:** `.env`, `src/services/auth.ts`

**Acción:**
1. Verificar en Firebase Console que:
   - Google Sign-In está habilitado
   - `localhost` está en Authorized Domains
   - OAuth Client ID está configurado en Google Cloud Console
2. Documentar la configuración requerida en `STACK.md`
3. Agregar validación de variables de entorno al iniciar la app

**Dependiente de:** Ninguna
**Esfuerzo estimado:** Bajo (30 min verificación + documentación)

---

### M-03: Agregar manejo de errores en auth (ALTO)
**Hallazgos:** #3, #14 (ALTOS)
**Problema:** `getGoogleRedirectResult` y `loginWithGoogle` retornan null en caso de error sin feedback al usuario. Errores silenciosos.
**Archivo afectado:** `src/services/auth.ts:75-78`, `src/pages/Login.tsx:20-22`

**Acción:**
1. Modificar funciones de auth para retornar `{ success, error }` en vez de solo `null`
2. Mostrar errores al usuario en Login.tsx y Register.tsx
3. Loggear errores para debugging (sin exponer datos sensibles)

**Dependiente de:** M-01 (AuthProvider)
**Esfuerzo estimado:** Bajo (1-2 horas)

---

### M-04: Invalidación de caché en Dashboard (ALTO)
**Hallazgos:** #5 (ALTO)
**Problema:** `addPurchase` no refresca Dashboard automáticamente. El usuario ve datos desactualizados después de agregar una compra.
**Archivo afectado:** `src/pages/AddPurchase.tsx:69`, `src/pages/Dashboard.tsx:27-62`

**Acción:**
1. Implementar invalidación de caché o estado compartido entre AddPurchase y Dashboard
2. Opción A: Usar React Query o SWR para manejo de estado del servidor
3. Opción B: Usar un evento custom o contexto para notificar cambios
4. Verificar que el Dashboard se actualice al volver de AddPurchase

**Dependiente de:** M-01 (AuthProvider)
**Esfuerzo estimado:** Medio (2-3 horas)

---

### M-05: Incluir receiptImageUrl en modo manual (BAJO)
**Hallazgos:** #6 (BAJO)
**Problema:** `addPurchase` ignora `receiptImageUrl` cuando el usuario registra manualmente.
**Archivo afectado:** `src/pages/AddPurchase.tsx:69`

**Acción:**
1. Verificar si es intencional (modo manual no debería tener imagen) o un bug
2. Si es bug: incluir `receiptImageUrl` en el objeto de compra
3. Si es intencional: documentar en código

**Dependiente de:** Ninguna
**Esfuerzo estimado:** Bajo (15 min)

---

### M-06: Corregir función duplicada en PurchaseHistory (MEDIO)
**Hallazgos:** #10 (MEDIO)
**Problema:** Función `loadPurchases` definida dos veces (segunda después del return).
**Archivo afectado:** `src/pages/PurchaseHistory.tsx:136-148`

**Acción:**
1. Eliminar la función duplicada (la segunda definición después del return)
2. Verificar que no haya otros code smells similares

**Dependiente de:** Ninguna
**Esfuerzo estimado:** Bajo (10 min)

---

### M-07: Agregar índices compuestos a Firestore (MEDIO)
**Hallazgos:** #12 (MEDIO)
**Problema:** `firestore.indexes.json` está vacío. Queries complejas pueden ser lentas a medida que crecen los datos.
**Archivo afectado:** `firestore.indexes.json`

**Acción:**
1. Analizar queries actuales en el código (colecciones, filtros, order by)
2. Definir índices compuestos necesarios
3. Actualizar `firestore.indexes.json`
4. Desplegar índices con `firebase deploy --only firestore:indexes`

**Dependiente de:** Ninguna
**Esfuerzo estimado:** Bajo (30 min)

---

### M-08: Eliminar directorio duplicado MercadoInteligente/ (MEDIO)
**Hallazgos:** #9 (MEDIO)
**Problema:** Directorio `MercadoInteligente/` es copia completa del proyecto raíz.
**Archivo afectado:** `MercadoInteligente/`

**Acción:**
1. Verificar que no contiene cambios únicos
2. Eliminar el directorio duplicado
3. Agregar a `.gitignore` si es necesario

**Dependiente de:** Ninguna
**Esfuerzo estimado:** Bajo (5 min)

---

## Resumen de Esfuerzo

| Mejora | Severidad | Esfuerzo | Dependencias |
|--------|-----------|----------|--------------|
| M-01 | CRÍTICO | 2-3h | Ninguna |
| M-02 | CRÍTICO | 30min | Ninguna |
| M-03 | ALTO | 1-2h | M-01 |
| M-04 | ALTO | 2-3h | M-01 |
| M-05 | BAJO | 15min | Ninguna |
| M-06 | MEDIO | 10min | Ninguna |
| M-07 | MEDIO | 30min | Ninguna |
| M-08 | MEDIO | 5min | Ninguna |

**Total estimado:** 7-10 horas de trabajo

---

## Orden Recomendado de Ejecución

1. **M-08** (5 min) — Limpieza rápida, sin riesgo
2. **M-06** (10 min) — Bug conocido, fácil de corregir
3. **M-05** (15 min) — Verificar intencionalidad
4. **M-07** (30 min) — Preparar Firestore para crecimiento
5. **M-02** (30 min) — Verificar configuración Firebase (bloqueante para auth)
6. **M-01** (2-3h) — AuthProvider (bloqueante para auth funcional)
7. **M-03** (1-2h) — Errores de auth (requiere M-01)
8. **M-04** (2-3h) — Cache invalidation (requiere M-01)

---

## Notas

- M-01 y M-02 son **bloqueantes**: sin ellos, Google Login no funciona y toda la app está bloqueada.
- M-03 y M-04 dependen de M-01 porque requieren el AuthProvider como base.
- M-05, M-06, M-07, M-08 son independientes y pueden ejecutarse en cualquier orden.
- La verificación de M-02 requiere acceso al Firebase Console (no es automatizable desde código).

**Esperando confirmación del usuario sobre qué se ataca primero.**
