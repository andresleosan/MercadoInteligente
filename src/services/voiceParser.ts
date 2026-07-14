import type { ParsedItem } from '@/types'

const STOP_WORDS = /^(?:compr |compre|comprar|mercado|supermercado|fuimos|para|en|el|la|los|las|un|una|unas|unos|del)\s*/i
const SEGMENT_SEP = /[,;]\s*(?:y\s+)?|\s+y\s+/g

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
