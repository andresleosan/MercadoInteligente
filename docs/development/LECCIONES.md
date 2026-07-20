# LECCIONES — Mercado Inteligente

Registro de lecciones aprendidas durante el desarrollo del proyecto.

---

## Formato de Entrada

```markdown
### [Fecha] — [Título de la lección]

**Contexto:** [Qué se estaba haciendo]
**Problema:** [Qué salió mal o fue más difícil de lo esperado]
**Solución:** [Cómo se resolvió]
**Prevención:** [Qué se haría diferente la próxima vez]
**Gap detectado:** [Sí/No — ¿falta una skill o herramienta?]
```

---

## Entradas

### 2026-07-20 — Auditoría MEJORAS.md: 6 de 8 ya estaban implementadas

**Contexto:** Se ejecutaron las 8 mejoras de la auditoría (M-01 a M-08) documentadas en MEJORAS.md.
**Problema:** Al revisar el código, 6 de 8 mejoras ya estaban implementadas (M-01 AuthProvider, M-03 errores auth, M-04 cache invalidation, M-05 receiptImageUrl, M-06 función duplicada, M-08 directorio). La documentación estaba desactualizada respecto al código real.
**Solución:** Se verificó cada mejora contra el código fuente antes de implementar. Solo M-07 (índices Firestore) requirió un cambio real.
**Prevención:** Actualizar MEJORAS.md inmediatamente después de implementar cada mejora, no al final de un sprint completo. Hacer una pasada de verificación antes de documentar pendientes.
**Gap detectado:** No

### 2026-07-20 — Índice Firestore faltante para query por storeId + createdAt

**Contexto:** Se agregó índice compuesto `userId+storeId+createdAt` a `firestore.indexes.json` para soportar `getPurchasesByStore()`.
**Problema:** La función `getPurchasesByStore()` en `purchases.ts` usa `where('storeId', '==', storeId)` + `where('createdAt', '>=', ...)` + `orderBy('createdAt', 'desc')`, pero el índice existente era `userId+storeId+purchaseDate`, no `userId+storeId+createdAt`. Sin el índice correcto, Firestore haría un full collection scan.
**Solución:** Se agregó el índice compuesto `userId ASC + storeId ASC + createdAt DESC` a `firestore.indexes.json`.
**Prevención:** Al crear funciones de query nuevas, verificar inmediatamente si el índice compuesto correspondiente existe. Usar el Firebase Console → Indexes para confirmar antes de desplegar.
**Gap detectado:** No

### 2026-07-20 —signInWithPopup vs signInWithRedirect para web apps

**Contexto:** Se verificó la configuración de Firebase Auth (M-02).
**Problema:** La auditoría original mencionaba que `signInWithRedirect` requería configuración específica en Firebase Console. Al revisar el código, se usaba `signInWithPopup`, que es más simple y no requiere configuración de redirect.
**Solución:** No se necesitó cambio — el código ya usaba la implementación correcta. Se documentó que la verificación de Firebase Console (Google Sign-In habilitado, Authorized Domains) sigue siendo necesaria.
**Prevención:** Al revisar configuración de servicios externos, verificar primero qué método se está usando en el código antes de asumir que hay un problema de configuración.
**Gap detectado:** No

---

## Estadísticas

| Métrica | Valor |
|---------|-------|
| Total de entradas | 3 |
| Gaps detectados | 0 |
| Skills propuestas | 0 |
