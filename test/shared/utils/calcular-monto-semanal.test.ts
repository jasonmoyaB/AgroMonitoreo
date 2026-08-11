import { describe, expect, it } from 'vitest'
import { calcularMontoSemanal } from '../../../src/shared/utils/calcular-monto-semanal'
import { calcularMontoQuincena } from '../../../src/shared/utils/calcular-monto-quincena'

describe('calcularMontoSemanal', () => {
  it('el mensual se parte en cuatro semanas', () => {
    expect(calcularMontoSemanal(400000, 'colones')).toBe(100000)
    expect(calcularMontoSemanal(1000000, 'colones')).toBe(250000)
  })

  it('dos semanas dan la quincena', () => {
    expect(calcularMontoSemanal(1000000, 'colones') * 2).toBe(calcularMontoQuincena(1000000, 'colones'))
  })

  it('en usd redondea a dos decimales', () => {
    expect(calcularMontoSemanal(1000, 'usd')).toBe(250)
    expect(calcularMontoSemanal(999.9, 'usd')).toBe(249.98)
  })

  it('sin salario cargado devuelve 0', () => {
    expect(calcularMontoSemanal(0, 'colones')).toBe(0)
  })
})
