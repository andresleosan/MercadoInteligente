# Diseño — Categorías en compras e historial

## Objetivo

Formalizar la tarea v3-Fase 1.5: verificar y documentar que las categorías asociadas a los productos se muestran en las compras del día y en el historial, sin duplicar una implementación que ya existe.

## Alcance

- Agregar tests de comportamiento para `TodayPurchases`.
- Agregar tests de comportamiento para `PurchaseHistory` en las vistas por fecha y por tienda.
- Verificar que un `PurchaseItem` con `category` resuelve y muestra `CategoryBadge`.
- Verificar que un item sin categoría continúa visible sin badge ni error.
- Marcar la tarea 1.5 como `aprobada` en `docs/roadmap/tasks-v3.md` después de ejecutar la verificación.

Fuera de alcance:

- Cambios en componentes de producción.
- Cambios en el modelo de Firestore o migraciones.
- Implementación del filtro por categoría de la tarea 1.6, aunque el código actual ya contiene parte de ese flujo.
- Refactorización para compartir el renderer de items entre ambas vistas.

## Arquitectura actual

- `TodayPurchases` obtiene categorías con `useCategories`, busca el `item.category` por id y renderiza `CategoryBadge` si existe coincidencia.
- `PurchaseHistory` usa el mismo patrón y renderiza items dentro de las vistas `date` y `store`.
- `CategoryBadge` es el contrato visual existente: muestra nombre, icono y color de la categoría.
- Los tests aislarán Firebase y servicios mediante mocks ya establecidos en el proyecto.

## Flujo esperado

1. El servicio de compras devuelve un `Purchase` con items que pueden tener `category`.
2. La vista carga la lista de categorías del usuario.
3. Cada vista resuelve el id de categoría contra esa lista.
4. Si hay coincidencia, muestra el badge junto al producto.
5. Si falta `category` o el id no coincide, muestra el producto sin badge y no lanza error.

## Verificación

- `TodayPurchases.test.tsx`: categoría válida, item sin categoría y preservación de la agrupación actual.
- Test de `PurchaseHistory`: categoría válida en vista por fecha, categoría válida en vista por tienda y item sin categoría.
- Suite completa de Vitest.
- Lint y build.
- E2E completo para confirmar que el historial existente no se rompe.

## Criterio de aceptación

La tarea 1.5 se considera aprobada cuando los tests demuestran el comportamiento descrito en ambas vistas, los comandos de verificación pasan y no se modifica la lógica de producción.
