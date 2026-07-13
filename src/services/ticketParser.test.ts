import { describe, it, expect } from 'vitest'
import { parseTicket, isLowConfidence } from './ticketParser'

describe('ticketParser', () => {
  describe('parseTicket', () => {
    it('should parse a clean ticket line', () => {
      const text = 'Leche entera 1L          450.00'
      const result = parseTicket(text)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Leche entera 1L')
      expect(result[0].unitPrice).toBe(450)
      expect(result[0].quantity).toBe(1)
      expect(result[0].totalPrice).toBe(450)
    })

    it('should parse line with comma decimal separator', () => {
      const text = 'Pan integral            120,50'
      const result = parseTicket(text)
      expect(result).toHaveLength(1)
      expect(result[0].unitPrice).toBe(120.5)
    })

    it('should detect "2x" quantity prefix', () => {
      const text = '2x Fideos tirabuzon      180.00'
      const result = parseTicket(text)
      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(2)
      expect(result[0].name).toBe('Fideos tirabuzon')
      expect(result[0].unitPrice).toBe(180)
      expect(result[0].totalPrice).toBe(360)
    })

    it('should detect "x2" suffix quantity', () => {
      const text = 'Yogur durazno x2         200.00'
      const result = parseTicket(text)
      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(2)
      expect(result[0].totalPrice).toBe(400)
    })

    it('should filter out non-product lines (headers, totals)', () => {
      const text = [
        'SUPERMERCADO COTO',
        'Fecha: 13/07/2026',
        'Leche entera 1L          450.00',
        'Pan integral             120,50',
        'TOTAL                    570.50',
        'Gracias por su compra',
      ].join('\n')
      const result = parseTicket(text)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Leche entera 1L')
      expect(result[1].name).toBe('Pan integral')
    })

    it('should return empty array for empty text', () => {
      expect(parseTicket('')).toHaveLength(0)
      expect(parseTicket('\n\n\n')).toHaveLength(0)
    })

    it('should filter lines with confidence < 50 when words provided', () => {
      const text = 'Leche entera 1L          450.00\nFideos          180.00'
      const words = [
        { text: 'Leche', confidence: 90, bbox: { x0: 0, y0: 0, x1: 50, y1: 20 } },
        { text: 'entera', confidence: 85, bbox: { x0: 60, y0: 0, x1: 120, y1: 20 } },
        { text: '1L', confidence: 80, bbox: { x0: 130, y0: 0, x1: 150, y1: 20 } },
        { text: '450.00', confidence: 88, bbox: { x0: 200, y0: 0, x1: 250, y1: 20 } },
        { text: 'Fideos', confidence: 30, bbox: { x0: 0, y0: 30, x1: 60, y1: 50 } },
        { text: '180.00', confidence: 25, bbox: { x0: 200, y0: 30, x1: 250, y1: 50 } },
      ]
      const result = parseTicket(text, words)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Leche entera 1L')
    })

    it('should assign confidence to each parsed item', () => {
      const text = 'Leche entera 1L          450.00'
      const words = [
        { text: 'Leche', confidence: 90, bbox: { x0: 0, y0: 0, x1: 50, y1: 20 } },
        { text: 'entera', confidence: 80, bbox: { x0: 60, y0: 0, x1: 120, y1: 20 } },
        { text: '1L', confidence: 70, bbox: { x0: 130, y0: 0, x1: 150, y1: 20 } },
        { text: '450.00', confidence: 60, bbox: { x0: 200, y0: 0, x1: 250, y1: 20 } },
      ]
      const result = parseTicket(text, words)
      expect(result[0].confidence).toBe(75)
    })
  })

  describe('isLowConfidence', () => {
    it('should return true for scores between 50 and 69', () => {
      expect(isLowConfidence(50)).toBe(true)
      expect(isLowConfidence(60)).toBe(true)
      expect(isLowConfidence(69)).toBe(true)
    })
    it('should return false for scores < 50 or >= 70', () => {
      expect(isLowConfidence(49)).toBe(false)
      expect(isLowConfidence(70)).toBe(false)
      expect(isLowConfidence(90)).toBe(false)
    })
  })
})
