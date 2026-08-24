import { describe, expect, it } from 'vitest'
import { obtenerLimitesFecha } from '../../../../src/features/captura/utils/obtener-limites-fecha'

const HOY = '2026-08-19'

describe('obtenerLimitesFecha', () => {
  it('en el mes en curso el ultimo dia elegible es hoy', () => {
    expect(obtenerLimitesFecha(2026, 8, HOY)).toEqual({ mesMaximo: 8, diaMaximo: 19 })
  })

  it('en un mes pasado del anio en curso deja el mes completo', () => {
    expect(obtenerLimitesFecha(2026, 7, HOY).diaMaximo).toBe(31)
  })

  it('en el anio en curso no deja pasar del mes de hoy', () => {
    expect(obtenerLimitesFecha(2026, 12, HOY).mesMaximo).toBe(8)
  })

  it('en un anio pasado deja los doce meses', () => {
    expect(obtenerLimitesFecha(2025, 12, HOY)).toEqual({ mesMaximo: 12, diaMaximo: 31 })
  })

  it('febrero bisiesto de un anio pasado termina el 29', () => {
    expect(obtenerLimitesFecha(2024, 2, HOY).diaMaximo).toBe(29)
  })
})
