import { describe, expect, it } from 'vitest'
import { calcularDeduccionAusencias } from '../../../../src/features/planilla/utils/calcular-deduccion-ausencias'

describe('calcularDeduccionAusencias', () => {
  it('un dia ausente vale la jornada completa de 8 horas', () => {
    expect(calcularDeduccionAusencias({ diasAusentes: 1, valorHora: 1750, moneda: 'colones' })).toBe(14000)
  })

  it('dos dias ausentes descuentan el doble', () => {
    expect(calcularDeduccionAusencias({ diasAusentes: 2, valorHora: 1750, moneda: 'colones' })).toBe(28000)
  })

  it('sin ausencias no descuenta nada', () => {
    expect(calcularDeduccionAusencias({ diasAusentes: 0, valorHora: 1750, moneda: 'colones' })).toBe(0)
  })

  it('valor hora sin definir no descuenta, en vez de descontar mal', () => {
    expect(calcularDeduccionAusencias({ diasAusentes: 3, valorHora: 0, moneda: 'usd' })).toBe(0)
  })

  it('en usd redondea a dos decimales', () => {
    expect(calcularDeduccionAusencias({ diasAusentes: 1, valorHora: 2.4567, moneda: 'usd' })).toBe(19.65)
  })

  it('en colones redondea al entero', () => {
    expect(calcularDeduccionAusencias({ diasAusentes: 1, valorHora: 1750.06, moneda: 'colones' })).toBe(14000)
  })
})
