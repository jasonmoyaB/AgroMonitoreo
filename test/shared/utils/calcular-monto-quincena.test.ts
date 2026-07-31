import { describe, expect, it } from 'vitest'
import { calcularMontoQuincena } from '../../../src/shared/utils/calcular-monto-quincena'

describe('calcularMontoQuincena', () => {
  it('parte el salario mensual en dos', () => {
    expect(calcularMontoQuincena(400000, 'colones')).toBe(200000)
    expect(calcularMontoQuincena(1000, 'usd')).toBe(500)
  })

  it('en colones redondea al entero: nadie paga centimos de colon', () => {
    expect(calcularMontoQuincena(375001, 'colones')).toBe(187501)
    expect(calcularMontoQuincena(375003, 'colones')).toBe(187502)
  })

  it('en usd conserva dos decimales', () => {
    expect(calcularMontoQuincena(1000.55, 'usd')).toBe(500.28)
    expect(calcularMontoQuincena(999.99, 'usd')).toBe(500)
  })

  it('un salario sin definir da cero, no NaN', () => {
    expect(calcularMontoQuincena(0, 'colones')).toBe(0)
    expect(calcularMontoQuincena(0, 'usd')).toBe(0)
  })

  it('no arrastra el error de coma flotante de la division', () => {
    expect(calcularMontoQuincena(0.3, 'usd')).toBe(0.15)
    expect(calcularMontoQuincena(1234.57, 'usd')).toBe(617.29)
  })
})
