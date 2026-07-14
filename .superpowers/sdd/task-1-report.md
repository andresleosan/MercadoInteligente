# Task 1 Report: voiceParser — parsear texto a productos

## What was implemented

`src/services/voiceParser.ts` — pure function `parseVoiceText(text: string): ParsedItem[]` that converts Spanish natural-language shopping phrases into structured product objects.

Key responsibilities:
- Splits input into segments on commas, semicolons, or standalone "y"
- Matches each segment against two regex patterns (with "a" preposition and without)
- Extracts optional quantity, product name, and unit price
- Strips Spanish stop words from product names
- Handles thousands-separator dots in prices (e.g. "1.200")
- Returns `ParsedItem[]` with computed `totalPrice` and `confidence: 100`

## What was tested and test results

All 8 tests pass:

| Test | Status |
|------|--------|
| parsea "leche a 1200" como un item | PASS |
| parsea frase completa con varios items | PASS |
| parsea "leche 1200" sin "a" | PASS |
| filtra palabras vacías | PASS |
| retorna array vacío si no hay productos detectables | PASS |
| soporta números con punto de miles "1.200" | PASS |
| texto vacío retorna array vacío | PASS |
| maneja "y" como separador | PASS |

## TDD Evidence

### RED phase

Command:
```
npx vitest run src/services/voiceParser.test.ts 2>&1
```

Output:
```
FAIL src/services/voiceParser.test.ts
Error: Failed to resolve import "./voiceParser" from "src/services/voiceParser.test.ts".
Does the file exist?
```

Test file imported a module that did not exist — expected failure.

### GREEN phase

After writing `voiceParser.ts`, same command:

```
✓ src/services/voiceParser.test.ts (8 tests)
Test Files  1 passed (1)
Tests       8 passed (8)
```

## Files changed

- `src/services/voiceParser.test.ts` — created (test suite)
- `src/services/voiceParser.ts` — created (implementation)

## Self-review findings

Two bugs were found and fixed in the implementation from the brief:

1. **SEGMENT_SEP regex** (`/[,;]?\s*(?:y\s+)?/g` → `/[,;]\s*(?:y\s+)?|\s+y\s+/g`):
   - Original had `[,;]?` making comma/semicolon optional and `\s*` matching any whitespace
   - This caused splitting on EVERY space within a phrase (e.g. `"leche a 1200"` split into 3 segments: `"leche"`, `"a"`, `"1200"`)
   - Fix: only split on explicit separators (comma, semicolon, or standalone "y")

2. **STOP_WORDS regex** (`/^(compr |...)$/i` → `/^(?:compr |...)\s*/i`):
   - Original had `$` anchor preventing prefix matching (e.g. `"compr leche"` didn't match because `$` required end-of-string after the stop word)
   - Fix: remove `$` and add `\s*` to consume optional trailing whitespace after stop words

Without these fixes, 6 of 8 tests failed (only empty-text and no-match tests passed).

## Issues or concerns

None. The implementation is complete, tested, and working.
