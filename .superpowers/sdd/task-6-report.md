# Task 6 Report — useCategories hook

## Qué implementé
- Creé `src/hooks/useCategories.ts` con el código exacto del brief.
- Hook `useCategories(userId)` que consume `getCategories`, `createCategory`, `updateCategory`, `deleteCategory` desde `@/services/categories`.
- Retorna `{ categories, loading, error, create, update, remove, refresh }` tipado vía `UseCategoriesReturn`.
- Patrón idéntico al de `useStores.ts` (useState + useCallback + useEffect con dependencia en `userId`).

## Typecheck
`npx tsc --noEmit` → sin errores, sin output.

## Archivos cambiados
- `src/hooks/useCategories.ts` (nuevo, 73 líneas)

## Commit
- SHA: `a0193e1`
- Mensaje: `feat: add useCategories hook for category management`

## Auto-revisión
- **Firmas verificadas**: `createCategory(userId, name, icon) → Promise<Category>`, `updateCategory(userId, id, Partial<Pick<Category,'name'|'icon'>>) → Promise<void>`, `deleteCategory(userId, id) → Promise<void>` coinciden con el hook.
- **Tipo Category**: `{ id, name, icon, isDefault }` — el spread `{ ...cat, ...data }` en `update` preserva `id` e `isDefault`, solo reemplaza `name`/`icon`. Correcto.
- **Loading state**: `loading` arranca en `true`, y `fetchCategories` lo gestiona con setLoading(true)/finally setLoading(false). El early return si no hay `userId` deja `loading=true` permanentemente — mismo comportamiento que `useStores.ts` ( patrón consistente del codebase, no un defecto de esta tarea).
- **Mensajes de error**: `'Error al cargar categorías'` en catch de fetch es genérico (no usa `err.message`); difiere levemente de `useStores.ts` que sí hace `err instanceof Error ? err.message : fallback`. Mantuve el texto del brief textualmente. No es bloqueante: el servicio ya lanza errores con mensajes这只очек específicos que se tragan aquí, pero es lo que pide el brief.
- **Tests**: el brief indica explícitamente que no requiere tests (el hook es wrapper simple de servicios ya testeados).

## Conclusión
DONE — implementación fiel al brief, typecheck limpio, commit creado.
