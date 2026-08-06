# Diseño — Categorización automática en carga manual

## Alcance

Completar v3-Fase 1.4: sugerir una categoría mientras el usuario escribe el nombre de un producto en el formulario manual.

## Diseño aprobado

- Reutilizar `suggestCategory(userId, productName)` como única fuente de sugerencias.
- Mantener una categoría por cada fila manual, asociada al índice del producto durante la edición.
- Consultar después de una pausa breve y cancelar timers anteriores para evitar llamadas por cada pulsación.
- Preseleccionar la sugerencia cuando existe una coincidencia; permitir que el usuario la cambie mediante `CategorySelector` o seleccione `Sin categoría`.
- Incluir la categoría seleccionada en los `PurchaseItem` enviados a `addPurchase`.
- No modificar los flujos OCR, voz ni el modelo de Firestore existente.

## Casos límite

- Nombre vacío o menor de tres caracteres: limpiar la sugerencia y no consultar.
- Producto desconocido: mantener `Sin categoría`.
- Error de categorización: no bloquear el registro; mantener la selección actual y registrar el error para diagnóstico.
- Eliminar una fila: reindexar las categorías restantes.

## Verificación

- Test de componente: sugerencia automática, cambio manual y limpieza al borrar el nombre.
- Test de integración: compra manual persiste la categoría seleccionada.
- Suite completa de Vitest, lint, build y E2E antes de cerrar la tarea.
