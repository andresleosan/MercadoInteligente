import type { ParsedItem } from '@/types'

const STOP_WORDS = /^(?:compr |compre|comprar|mercado|supermercado|fuimos|para|en|el|la|los|las|un|una|unas|unos|del)\s*/i
const SEGMENT_SEP = /[,;]\s*(?:y\s+)?|\s+y\s+/g
const QUANTITY_WORDS: Record<string, number> = {
  un: 1,
  una: 1,
  uno: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
}

const PATTERN_WITH_A = /^(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince)\s+)?(.+?)\s+a\s+(\d{1,3}(?:\.\d{3})*|\d+)(?:\s+con\s+(\d+(?:[.,]\d+)?)\s*(?:%|por\s*ciento|porciento)\s+de\s+descuento)?$/i
const PATTERN_WITHOUT_A = /^(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince)\s+)?(.+?)\s+(\d{1,3}(?:\.\d{3})*|\d+)(?:\s+con\s+(\d+(?:[.,]\d+)?)\s*(?:%|por\s*ciento|porciento)\s+de\s+descuento)?$/i

function parseQuantity(raw: string | undefined): number {
  if (!raw) return 1

  const normalized = raw.toLowerCase()
  if (/^\d+$/.test(normalized)) {
    return parseInt(normalized, 10)
  }

  return QUANTITY_WORDS[normalized] || 1
}

function parsePrice(raw: string): number {
  const cleaned = raw.replace(/,/g, '')
  const dotIndex = cleaned.lastIndexOf('.')
  if (dotIndex !== -1 && cleaned.length - dotIndex <= 3) {
    return parseFloat(cleaned)
  }
  return parseInt(cleaned.replace(/\./g, ''), 10)
}

function parseDiscount(raw: string | undefined): number | undefined {
  if (!raw) return undefined
  const value = Number(raw.replace(',', '.'))
  if (!Number.isFinite(value)) return undefined
  return Math.min(100, Math.max(0, value))
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
    let discountPercent: number | undefined

    const matchA = segment.match(PATTERN_WITH_A)
    const matchNoA = segment.match(PATTERN_WITHOUT_A)

    if (matchA) {
      quantity = parseQuantity(matchA[1])
      name = cleanName(matchA[2]!)
      unitPrice = parsePrice(matchA[3]!)
      discountPercent = parseDiscount(matchA[4])
    } else if (matchNoA) {
      quantity = parseQuantity(matchNoA[1])
      name = cleanName(matchNoA[2]!)
      unitPrice = parsePrice(matchNoA[3]!)
      discountPercent = parseDiscount(matchNoA[4])
    } else {
      continue
    }

    if (!name) continue

    const grossTotal = unitPrice * quantity
    const totalPrice = discountPercent ? Math.round(grossTotal * (1 - discountPercent / 100)) : grossTotal

    items.push({
      name,
      unitPrice,
      quantity,
      totalPrice,
      confidence: 100,
      ...(discountPercent !== undefined ? { discountPercent } : {}),
    })
  }

  return items
}
