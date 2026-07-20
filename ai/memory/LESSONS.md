# Lecciones Aprendidas — Memoria de Agentes

**Última actualización:** 2026-07-20

---

## Lecciones Críticas

### 1. Documentación desactualizada vs. código
**Fecha:** 2026-07-20
**Contexto:** Auditoría MEJORAS.md
**Problema:** 6 de 8 mejoras ya estaban implementadas pero documentadas como pendientes
**Lección:** SIEMPRE verificar código fuente antes de asumir que algo necesita implementarse
**Prevención:** Actualizar documentación inmediatamente después de cada cambio

### 2. Índices Firestore faltantes
**Fecha:** 2026-07-20
**Contexto:** Query por storeId + createdAt
**Problema:** Queries sin índice compuesto causan full collection scan
**Lección:** Al crear funciones query nuevas, verificar/crear índice compuesto correspondiente
**Prevención:** Usar Firebase Console → Indexes antes de desplegar

### 3. signInWithPopup vs signInWithRedirect
**Fecha:** 2026-07-20
**Contexto:** Configuración Firebase Auth
**Problema:** Auditoría asumió uso de redirect cuando código usaba popup
**Lección:** Verificar método real en código antes de diagnosticar problema de configuración
**Prevención:** Buscar en código antes de asumir configuración

---

## Lecciones de Arquitectura

### 4. Estructura de repositorio
**Fecha:** 2026-07-20
**Contexto:** Reorganización documentación
**Problema:** 16 archivos .md en raíz mezclados con configuraciones
**Lección:** Mantener raíz limpia, documentación en docs/, configuraciones en raíz
**Prevención:** Definir estructura clara al inicio del proyecto

### 5. Referencias relativas en documentación
**Fecha:** 2026-07-20
**Contexto:** Mover archivos a docs/
**Problema:** Referencias absolutas se rompen al mover archivos
**Lección:** Usar referencias relativas consistentes
**Prevención:** Verificar enlaces después de cada migración

---

## Lecciones de Testing

### 6. Tests lentos
**Fecha:** 2026-07-20
**Contexto:** Ejecución de tests
**Problema:** Tests toman ~5 minutos en completarse
**Lección:** Considerar parallelización o separación de tests lentos
**Prevención:** Monitorear tiempo de ejecución

### 7. Warnings en tests
**Fecha:** 2026-07-20
**Contexto:** React Router Future Flag Warning
**Problema:** Warnings no bloquean pero indican deuda técnica
**Lección:** Address warnings antes de upgrades mayores
**Prevención:** Revisar warnings periódicamente

---

## Lecciones de Agentes

### 8. Coordinación entre agentes
**Fecha:** 2026-07-20
**Contexto:** Agencia Los Titanes
**Problema:** Múltiples agentes modificando mismos archivos
**Lección:** Usar cronos como orquestador único, evitar conflictos
**Prevención:** Checkpoints obligatorios entre fases

### 9. Memoria entre sesiones
**Fecha:** 2026-07-20
**Contexto:** Múltiples sesiones de desarrollo
**Problema:** Pérdida de contexto entre sesiones
**Lección:** Documentar estado en ai/memory/ al final de cada sesión
**Prevención:** Actualizar STATUS.md regularmente

---

## Patrones Exitosos

1. **Ciclo de autocrítica:** Seguridad → Pruebas → Rendimiento
2. **Verificar antes de implementar:** Siempre revisar código existente
3. **Documentación viva:** Actualizar docs después de cada cambio
4. **Referencias relativas:** Mantener consistencia en enlaces
5. **Build + tests:** Ejecutar después de cada cambio significativo

---

## Errores a Evitar

1. ❌ Asumir sin verificar
2. ❌ Mover archivos sin actualizar referencias
3. ❌ Desplegar sin evidencia de tests
4. ❌ Ignorar warnings de herramientas
5. ❌ Documentar sin verificar código actual
