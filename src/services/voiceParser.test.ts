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

  it('parsea cantidades habladas como "tres harina pan a 3000"', () => {
    const result = parseVoiceText('tres harina pan a 3000')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Harina pan')
    expect(result[0]!.quantity).toBe(3)
    expect(result[0]!.unitPrice).toBe(3000)
    expect(result[0]!.totalPrice).toBe(9000)
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
