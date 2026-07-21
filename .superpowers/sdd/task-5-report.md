# Task 5 Report — Categorizer Service

## Qué implementé

Servicio de sugerencia de categorías con dos capas:
1. **Learning-first**: consulta `getCategoryForProduct` (Tarea 4) para resolver categorías que el usuario ya mapeó.
2. **Keyword fallback**: si no hay learning, busca palabras normalizadas en un `KEYWORD_MAP` estático con ~50 keywords cubriendo 8 categorías default (lacteos, panaderia, carnes, frutas-verduras, bebidas, limpieza, higiene, snacks).

Funciones exportadas:
- `normalizeProductName(name: string): string` — lowercase + trim.
- `suggestCategory(userId: string, productName: string): Promise<string | null>` — orquesta learning → keyword → null.

## Evidencia TDD

### RED (antes de implementar)
```
FAIL  src/tests/services/categorizer.test.ts
Error: Failed to resolve import "@/services/categorizer" from "src/tests/services/categorizer.test.ts". Does the file exist?
Test Files  1 failed (1)
Tests      no tests
```
Falla por la razón correcta: módulo inexistente (no typo, no error de configuración).

### GREEN (después de implementar)
```
✓ src/tests/services/categorizer.test.ts (5 tests) 7ms
Test Files  1 passed (1)
Tests      5 passed (5)
```

### Regresión (suite services completa)
```
✓ src/tests/services/categorizer.test.ts (5 tests)
✓ src/tests/services/categoryMapping.test.ts (9 tests)
✓ src/tests/services/categories.test.ts (10 tests)
Test Files  3 passed (3)
Tests      24 passed (24)
```

### Verificaciones adicionales
- `npx tsc -b --noEmit` → salida limpia (sin errores de tipos).
- `npx eslint src/services/categorizer.ts src/tests/services/categorizer.test.ts` → exit 0 (sin warnings).

## Archivos cambiados

- `src/services/categorizer.ts` (creado, 63 líneas) — implementación del servicio.
- `src/tests/services/categorizer.test.ts` (creado, 52 líneas) — 5 tests con mock de `categoryMapping`.

## Decisión de diseño

El brief advertía que el test `matches partial words` (`'leches enteras'` → `'lacteos'`) podría fallar porque el `KEYWORD_MAP` del spec solo incluía `'leche'` (singular). El brief ofrecía dos opciones:
- (a) ajustar el test
- (b) añadir `'leches'` al KEYWORD_MAP

**Elegí (b)** y añadí solo `'leches'` (mantuve YAGNI: no construí un sistema de pluralización speculativo, no añadí plurales de otros sustantivos que ningún test pide). Razón: el comportamiento del test refleja un caso real (usuarios escriben "leches") y el mapa de keywords está diseñado precisamente para crecer conforme se identifican variantes comunes, sin acoplar el test a un hack de normalización.

## Hallazgos de auto-revisión

- **Completitud:** ✓ todo lo del spec implementado; 5 tests del brief reproducción exacta.
- **Calidad:** nombres claros (`normalizeProductName`, `suggestCategory`, `learned`), estilo idéntico a `categoryMapping.ts` (imports relativos, sin comentarios, sin tipado redundante).
- **Disciplina (YAGNI):** sin sistema de pluralización genérico, sin DI, sin caché de mapa, sin funciones de normalización adicionales (acentos, plurales). Solo lo que los tests exigen.
- **Testing:** los 5 tests verifican comportamiento observable, no detalles de implementación. El mock es solo de `getCategoryForProduct` (dependencia externa legitima — Firestore), no de código propio.

Sin inquietudes. Listo para revisión.
