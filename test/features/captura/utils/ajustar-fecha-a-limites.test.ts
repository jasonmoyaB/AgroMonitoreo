import { describe, expect, it } from 'vitest'
import { ajustarFechaALimites } from '../../../../src/features/captura/utils/ajustar-fecha-a-limites'

const HOY = '2026-08-19'

describe('ajustarFechaALimites', () => {
  it('deja intacta una fecha pasada valida', () => {
    expect(ajustarFechaALimites({ anio: 2026, mes: 7, dia: 31 }, HOY)).toEqual({ anio: 2026, mes: 7, dia: 31 })
  })

  it('recorta al dia de hoy dentro del mes en curso', () => {
    expect(ajustarFechaALimites({ anio: 2026, mes: 8, dia: 31 }, HOY)).toEqual({ anio: 2026, mes: 8, dia: 19 })
  })

  it('recorta mes y dia cuando el mes elegido todavia no llego', () => {
    expect(ajustarFechaALimites({ anio: 2026, mes: 12, dia: 25 }, HOY)).toEqual({ anio: 2026, mes: 8, dia: 19 })
  })

  it('no recorta un mes futuro si el anio es pasado', () => {
    expect(ajustarFechaALimites({ anio: 2025, mes: 12, dia: 31 }, HOY)).toEqual({ anio: 2025, mes: 12, dia: 31 })
  })

  it('recorta el 31 a un mes de 30 dias', () => {
    expect(ajustarFechaALimites({ anio: 2026, mes: 4, dia: 31 }, HOY)).toEqual({ anio: 2026, mes: 4, dia: 30 })
  })
})
