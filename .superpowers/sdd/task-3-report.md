# Task 3 Report: Create Categories Service

## Qué implementé

Servicio CRUD para categorías de usuario en `src/services/categories.ts`:

- `getCategories(userId)` — devuelve `[...DEFAULT_CATEGORIES, ...customCategories]` leyendo la subcolección `users/{userId}/categories`.
- `createCategory(userId, name, icon)` — añade un doc con `{ name, icon, isDefault: false }` y devuelve la `Category` construida.
- `updateCategory(userId, id, data)` — `updateDoc` con `Partial<Pick<Category, 'name' | 'icon'>>`.
- `deleteCategory(userId, id)` — `deleteDoc` del doc correspondiente.

Y tests unitarios reales en `src/tests/services/categories.test.ts` (10 tests) que mockean `firebase/firestore` y `@/config/firebase`, verificando que cada función llama a las APIs correctas con los argumentos esperados y devuelven lo especificado, más edge-cases de `db` nulo.

## Desviaciones del brief (justificadas)

1. **Import de `db`**: el brief dice `import { db } from './firebase'` pero ese archivo no existe en el proyecto; `db` se exporta desde `@/config/firebase`. Usé la ruta real, consistente con `src/services/stores.ts` (referencia del patrón del codebase).
2. **Null-check de `db`**: el brief omite el `if (!db) throw new Error('Firebase no inicializado')`. Lo añadí en las 4 funciones para igualar el patrón de `stores.ts` y porque `db` es tipadamente `Firestore | null` en `@/config/firebase`.
3. **Inlining de `getCustomCategories`**: el brief extrae un helper privado. Lo inlineé en `getCategories` para preservar el narrowing de TypeScript (`db` se reduce a `Firestore` después del null-check solo dentro de la misma función). El helper rompía el narrowing y producía `TS2769`.
4. **Tests reales en lugar de `expect(true).toBe(true)`**: el brief incluía tests placeholder triviales. La skill TDD exige verificar comportamiento real; escribí 10 tests que prueban llamadas a Firestore y resultados devueltos, incluyendo 4 tests de `db` nulo (uno por función).

## Evidencia TDD

### RED (antes de implementar el servicio)
```
FAIL  src/tests/services/categories.test.ts
Error: Failed to resolve import "@/services/categories" from "src/tests/services/categories.test.ts".
Does the file exist?
Test Files  1 failed (1)
Tests       no tests
```
Falla esperada: el servicio no existía.

### GREEN (después de implementar el servicio)
```
✓ src/tests/services/categories.test.ts (10 tests) 17ms
Test Files  1 passed (1)
Tests       10 passed (10)
```

### Suite completo
```
Test Files  34 passed (34)
Tests       181 passed (181)
```

### Typecheck
`npx tsc -b --noEmit` → sin errores.

### Lint
`npx eslint src/services/categories.ts src/tests/services/categories.test.ts` → sin errores.

## Archivos cambiados

- **Created:** `src/services/categories.ts` (59 líneas)
- **Created:** `src/tests/services/categories.test.ts` (154 líneas)

## Hallazgos de auto-revisión

- **Completitud:** las 4 funciones del spec están implementadas con sus firmas exactas.
- **Calidad:** sigo el patrón `stores.ts` del codebase (import desde `@/config/firebase`, null-check de `db`, misma convención de subcolección `users/{userId}/...`).
- **Disciplina (YAGNI):** no añadí validaciones de `name`/`icon` (la spec no las pide); no añadí `orderBy` (la spec no lo requiere para categorías, y el orden natural por defecto es `[...DEFAULT_CATEGORIES, ...customCategories]`); no añadí `serverTimestamp` (la spec no lo pedía y el tipo `Category` no tiene `createdAt`).
- **Testing:** los 10 tests verifican comportamiento (qué se llama a Firestore y qué se devuelve), no solo mocks. Los 4 tests de `db` nulo cubren el path de error.
- **Sin over-engineering:** el helper `getCustomCategories` se inlinó solo porque TS lo exigía, no por preferencia estética.

## Commits

- `9686e13` — feat: add categories CRUD service with tests
