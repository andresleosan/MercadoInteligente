import type { ParsedItem } from '@/types'

export interface Word {
  text: string
  confidence: number
  bbox?: { x0: number; y0: number; x1: number; y1: number }
}

const PRODUCT_LINE_REGEX = /^(.+?)[\s\t]+(\d+[.,]\d{2})$/
const QUANTITY_PREFIX_REGEX = /^(\d+)\s*[xX]\s*(.+?)[\s\t]+(\d+[.,]\d{2})$/
const QUANTITY_SUFFIX_REGEX = /^(.+?)\s+[xX](\d+)[\s\t]+(\d+[.,]\d{2})$/
const NON_PRODUCT_NAME_REGEX = /^(total|subtotal)\s*$/i

function parsePrice(raw: string): number {
  return parseFloat(raw.replace(',', '.'))
}

function lineConfidence(lineText: string, words: Word[] | undefined): number {
  if (!words || words.length === 0) return 100
  const lineWords = words.filter((w) => lineText.includes(w.text))
  if (lineWords.length === 0) return 100
  const sum = lineWords.reduce((acc, w) => acc + w.confidence, 0)
  return Math.round(sum / lineWords.length)
}

export function isLowConfidence(score: number): boolean {
  return score >= 50 && score < 70
}

export function parseTicket(text: string, words?: Word[]): ParsedItem[] {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
  const items: ParsedItem[] = []

  for (const line of lines) {
    const score = lineConfidence(line, words)
    if (score < 50) continue

    let quantity = 1
    let name = ''
    let unitPrice = 0

    const prefixMatch = line.match(QUANTITY_PREFIX_REGEX)
    const suffixMatch = line.match(QUANTITY_SUFFIX_REGEX)
    const simpleMatch = line.match(PRODUCT_LINE_REGEX)

    if (prefixMatch) {
      quantity = parseInt(prefixMatch[1]!, 10)
      name = prefixMatch[2]!.trim()
      unitPrice = parsePrice(prefixMatch[3]!)
    } else if (suffixMatch) {
      name = suffixMatch[1]!.trim()
      quantity = parseInt(suffixMatch[2]!, 10)
      unitPrice = parsePrice(suffixMatch[3]!)
    } else if (simpleMatch) {
      name = simpleMatch[1]!.trim()
      unitPrice = parsePrice(simpleMatch[2]!)
    } else {
      continue
    }

    if (NON_PRODUCT_NAME_REGEX.test(name)) continue

    items.push({
      name,
      unitPrice,
      quantity,
      totalPrice: unitPrice * quantity,
      confidence: score,
    })
  }

  return items
}
