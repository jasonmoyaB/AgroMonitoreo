import { describe, expect, it } from 'vitest'
import { leerNumeroNoNegativo } from '../../../src/shared/utils/leer-numero-no-negativo'

describe('leerNumeroNoNegativo', () => {
  it('acepta enteros y decimales', () => {
    expect(leerNumeroNoNegativo('300000')).toBe(300000)
    expect(leerNumeroNoNegativo('1750.50')).toBe(1750.5)
  })

  it('acepta cero', () => {
    expect(leerNumeroNoNegativo('0')).toBe(0)
  })

  it('ignora espacios alrededor', () => {
    expect(leerNumeroNoNegativo('  500  ')).toBe(500)
  })

  it('rechaza vacio', () => {
    expect(leerNumeroNoNegativo('')).toBeNull()
    expect(leerNumeroNoNegativo('   ')).toBeNull()
  })

  it('rechaza negativos', () => {
    expect(leerNumeroNoNegativo('-1')).toBeNull()
  })

  it('rechaza texto e Infinity', () => {
    expect(leerNumeroNoNegativo('abc')).toBeNull()
    expect(leerNumeroNoNegativo('Infinity')).toBeNull()
  })
})
