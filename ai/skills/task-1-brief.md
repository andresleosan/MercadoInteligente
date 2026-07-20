### Task 1: voiceParser — parsear texto a productos

**Files:**
- Create: `src/services/voiceParser.ts`
- Create: `src/services/voiceParser.test.ts`

**Interfaces:**
- Produces: `parseVoiceText(text: string): ParsedItem[]`

- [ ] **Step 1: Write the failing test**

```ts
// src/services/voiceParser.test.ts
import { describe, it, expect } from 'vitest'
import { parseVoiceText } from './voiceParser'

describe('parseVoiceText', () => {
  it('parsea "leche a 1200" como un item', () => {
    const result = parseVoiceText('leche a 1200')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Leche')
    expect(result[0]!.unitPrice).toBe(1200)
    expect(result[0]!.quantity).toBe(1)
  })

  it('parsea frase completa con varios items', () => {
    const result = parseVoiceText('compr leche a 1200, pan a 800, y 3 huevos a 2500')
    expect(result).toHaveLength(3)
    expect(result[0]!.name).toBe('Leche')
    expect(result[1]!.name).toBe('Pan')
    expect(result[2]!.name).toBe('Huevos')
    expect(result[2]!.quantity).toBe(3)
  })

  it('parsea "leche 1200" sin "a"', () => {
    const result = parseVoiceText('leche 1200')
    expect(result).toHaveLength(1)
    expect(result[0]!.unitPrice).toBe(1200)
  })

  it('filtra palabras vac as', () => {
    const result = parseVoiceText('compr leche a 1200')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Leche')
  })

  it('retorna array vac o si no hay productos detectables', () => {
    const result = parseVoiceText('hola c mo est s')
    expect(result).toHaveLength(0)
  })

  it('soporta n meros con punto de miles "1.200"', () => {
    const result = parseVoiceText('leche a 1.200')
    expect(result[0]!.unitPrice).toBe(1200)
  })

  it('texto vac o retorna array vac o', () => {
    expect(parseVoiceText('')).toHaveLength(0)
    expect(parseVoiceText('   ')).toHaveLength(0)
  })

  it('maneja "y" como separador', () => {
    const result = parseVoiceText('pan a 500 y leche a 1000')
    expect(result).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/services/voiceParser.test.ts 2>&1`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```ts
// src/services/voiceParser.ts
import type { ParsedItem } from '@/types'

const STOP_WORDS = /^(compr |compre|comprar|mercado|supermercado|fuimos|para|en|el|la|los|las|un|una|unas|unos|del)$/i
const SEGMENT_SEP = /[,;]?\s*(?:y\s+)?/g

const PATTERN_WITH_A = /^(?:(\d+)\s+)?(.+?)\s+a\s+(\d{1,3}(?:\.\d{3})*|\d+)$/
const PATTERN_WITHOUT_A = /^(?:(\d+)\s+)?(.+?)\s+(\d{1,3}(?:\.\d{3})*|\d+)$/

function parsePrice(raw: string): number {
  return parseInt(raw.replace(/\./g, ''), 10)
}

function cleanName(raw: string): string {
  return raw
    .replace(STOP_WORDS, '')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function parseVoiceText(text: string): ParsedItem[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const segments = trimmed
    .split(SEGMENT_SEP)
    .map((s) => s.trim())
    .filter(Boolean)

  const items: ParsedItem[] = []

  for (const segment of segments) {
    let quantity = 1
    let name = ''
    let unitPrice = 0

    const matchA = segment.match(PATTERN_WITH_A)
    const matchNoA = segment.match(PATTERN_WITHOUT_A)

    if (matchA) {
      quantity = matchA[1] ? parseInt(matchA[1], 10) : 1
      name = cleanName(matchA[2]!)
      unitPrice = parsePrice(matchA[3]!)
    } else if (matchNoA) {
      quantity = matchNoA[1] ? parseInt(matchNoA[1], 10) : 1
      name = cleanName(matchNoA[2]!)
      unitPrice = parsePrice(matchNoA[3]!)
    } else {
      continue
    }

    if (!name) continue

    items.push({
      name,
      unitPrice,
      quantity,
      totalPrice: unitPrice * quantity,
      confidence: 100,
    })
  }

  return items
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/services/voiceParser.test.ts 2>&1`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/voiceParser.ts src/services/voiceParser.test.ts
git commit -m "feat: voiceParser -- texto a ParsedItem[]"
```
