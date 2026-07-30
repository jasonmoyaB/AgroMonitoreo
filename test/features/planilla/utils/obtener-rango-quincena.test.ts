import { describe, expect, it } from 'vitest'
import { obtenerRangoQuincena } from '../../../../src/features/planilla/utils/obtener-rango-quincena'

describe('obtenerRangoQuincena', () => {
  it('la primera quincena siempre va del 1 al 15', () => {
    expect(obtenerRangoQuincena({ anio: 2026, mes: 2, quincena: 1 })).toEqual({ inicio: '2026-02-01', fin: '2026-02-15' })
    expect(obtenerRangoQuincena({ anio: 2026, mes: 7, quincena: 1 })).toEqual({ inicio: '2026-07-01', fin: '2026-07-15' })
  })

  it('la segunda quincena termina el ultimo dia del mes de 31 dias', () => {
    expect(obtenerRangoQuincena({ anio: 2026, mes: 7, quincena: 2 })).toEqual({ inicio: '2026-07-16', fin: '2026-07-31' })
  })

  it('la segunda quincena termina el ultimo dia del mes de 30 dias', () => {
    expect(obtenerRangoQuincena({ anio: 2026, mes: 4, quincena: 2 })).toEqual({ inicio: '2026-04-16', fin: '2026-04-30' })
  })

  it('febrero no bisiesto termina el 28', () => {
    expect(obtenerRangoQuincena({ anio: 2026, mes: 2, quincena: 2 })).toEqual({ inicio: '2026-02-16', fin: '2026-02-28' })
  })

  it('febrero bisiesto termina el 29', () => {
    expect(obtenerRangoQuincena({ anio: 2028, mes: 2, quincena: 2 })).toEqual({ inicio: '2028-02-16', fin: '2028-02-29' })
  })

  it('rellena con cero los meses de un digito', () => {
    expect(obtenerRangoQuincena({ anio: 2026, mes: 1, quincena: 2 }).inicio).toBe('2026-01-16')
  })
})
