# Task 4 Fix Report: Address Review Findings for Category Mapping Service

## Estado: DONE

## Problemas arreglados

### Critical #1: firestore.rules no protege categoryMappings

Las reglas de Firestore NO son cascada por defecto — las subcolecciones requieren su propio match explícito. El archivo `firestore.rules` no tenía un match block para `categoryMappings`, dejando la subcolección sin protección (denegada por default, pero sin regla explícita que documentara la intención).

**Acción tomada:** Añadido match block análogo al de `stores` / `purchases`, dentro de `match /users/{userId}`:

```
match /categoryMappings/{mappingId} {
  allow read, write: if isAuthenticated() && isOwner(userId);
}
```

Archivo: `firestore.rules:31-33`

### Important #2: createdAt: new Date() vs serverTimestamp()

El patrón del codebase (`src/services/stores.ts:70`, `purchases.ts:36`, `auth.ts:35`, `budget.ts`, `dailyBudget.ts`, `storeBudget.ts`) usa `serverTimestamp()` de Firestore para timestamps authoritative, no `new Date()` del cliente (que depende del reloj local y no sobrevive offline).

**Acción tomada:**
- Añadido `serverTimestamp` al import de `firebase/firestore` en `src/services/categoryMapping.ts:9`.
- Reemplazado `createdAt: new Date()` por `createdAt: serverTimestamp()` en el `addDoc` de `saveCategoryMapping` (`src/services/categoryMapping.ts:51`).

### Important #3: Campo userId redundante en el doc

El path de la subcolección `users/{userId}/categoryMappings` ya scopea el documento al usuario. Duplicar `userId` dentro del doc es redundante, aumenta el storage y abre la puerta a inconsistencias (un doc podría tener un `userId` interno distinto del usuario que lo posee).

**Acción tomada:** Eliminado el campo `userId` del payload en `addDoc` (`src/services/categoryMapping.ts:47-51`).

### Minor #5: Encoding mojibake en test

El string `'Pan Francés'` en `src/tests/services/categoryMapping.test.ts` estaba en mojibake (`Pan Franc├®s`) debido a una mala decodificación de UTF-8.

**Acción tomada:** Reemplazado por `'Pan Frances'` (sin acento, ASCII-safe) y actualizado el expectation correspondiente (`'pan frances'`). Sin acento para evitar cualquier problema futuro de encoding en editores/CI que no preserven UTF-8.

## Ajuste en tests por los cambios de implementación

Porque el fix #2 cambia `new Date()` por `serverTimestamp()`, el mock de `firebase/firestore` en el test necesita exponer `serverTimestamp`. Y porque el fix #3 elimina `userId` del payload, el assertion de `addDoc` tuvo que actualizarse:

- Añadido `serverTimestamp: () => ({ _serverTimestamp: true })` al mock de `firebase/firestore` (`src/tests/services/categoryMapping.test.ts:32`).
- Actualizado el assertion del test `creates a new mapping when none exists` para no esperar `userId` y esperar `createdAt: { _serverTimestamp: true }` (`src/tests/services/categoryMapping.test.ts:93-98`).

No se añadieron ni eliminaron tests — los 9 tests existentes cubren el comportamiento cambiado.

## Tests ejecutados y resultados

```
npx vitest run src/tests/services/categoryMapping.test.ts

 ✓ src/tests/services/categoryMapping.test.ts (9 tests) 166ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at 17:29:17
   Duration 14.97s
```

Los 9 tests pasan: 3 de `getCategoryForProduct` + 3 de `saveCategoryMapping` (incluyendo el create-path modificado) + 3 de `getMappingsByCategory`.

## Typecheck resultado

```
npx tsc --noEmit
```

Salida: sin output, código de salida 0 — typecheck pasa sin errores. La adición de `serverTimestamp` al import es consistente con el tipo del módulo `firebase/firestore`.

## Commits

- `fix: address review findings for category mapping service` — arregla Critical #1, Important #2, Important #3, Minor #5. Archivos: `firestore.rules`, `src/services/categoryMapping.ts`, `src/tests/services/categoryMapping.test.ts`.

## Archivos cambiados

- `firestore.rules` — añadido match block para `categoryMappings/{mappingId}` (4 líneas).
- `src/services/categoryMapping.ts` — import de `serverTimestamp`, reemplazo de `new Date()` y eliminación de `userId` redundante.
- `src/tests/services/categoryMapping.test.ts` — mock de `serverTimestamp`, assertion actualizado, mojibake corregido.
