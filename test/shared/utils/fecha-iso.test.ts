import { describe, expect, it } from 'vitest'
import { construirAnioMes, construirFechaIso, descomponerFechaIso, formatearFechaIsoDdMmAaaa } from '../../../src/shared/utils/fecha-iso'

// el filtro del dashboard compara con startsWith: sin el cero a la izquierda '2026-7'
// no matchea ninguna fecha y los KPIs de enero a septiembre se ven vacios
describe('construirAnioMes', () => {
  it('rellena el mes de un digito con cero', () => {
    expect(construirAnioMes(2026, 7)).toBe('2026-07')
  })

  it('deja intacto el mes de dos digitos', () => {
    expect(construirAnioMes(2026, 12)).toBe('2026-12')
  })
})

describe('construirFechaIso', () => {
  it('rellena mes y dia de un digito con cero', () => {
    expect(construirFechaIso({ anio: 2026, mes: 1, dia: 5 })).toBe('2026-01-05')
  })

  it('deja intactos los de dos digitos', () => {
    expect(construirFechaIso({ anio: 2026, mes: 12, dia: 31 })).toBe('2026-12-31')
  })
})

describe('descomponerFechaIso', () => {
  it('devuelve los tres campos como numeros sin cero a la izquierda', () => {
    expect(descomponerFechaIso('2026-01-05')).toEqual({ anio: 2026, mes: 1, dia: 5 })
  })

  it('es la inversa de construirFechaIso', () => {
    const partes = { anio: 2026, mes: 7, dia: 9 }

    expect(descomponerFechaIso(construirFechaIso(partes))).toEqual(partes)
  })
})

describe('formatearFechaIsoDdMmAaaa', () => {
  it('invierte el orden y usa barras', () => {
    expect(formatearFechaIsoDdMmAaaa('2026-07-28')).toBe('28/07/2026')
  })

  it('mantiene el cero a la izquierda al invertir', () => {
    expect(formatearFechaIsoDdMmAaaa('2026-01-05')).toBe('05/01/2026')
  })
})
