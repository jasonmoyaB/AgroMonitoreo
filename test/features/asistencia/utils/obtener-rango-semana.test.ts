import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { obtenerRangoSemana } from '../../../../src/features/asistencia/utils/obtener-rango-semana'

const MIERCOLES_15_JULIO_2026 = new Date(2026, 6, 15, 10, 30)
const DOMINGO_12_JULIO_2026 = new Date(2026, 6, 12, 10, 30)

describe('obtenerRangoSemana', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('en un dia entre semana devuelve el lunes y el domingo de esa semana', () => {
    vi.setSystemTime(MIERCOLES_15_JULIO_2026)

    const rango = obtenerRangoSemana(0)

    expect(rango.inicio).toBe('2026-07-13')
    expect(rango.fin).toBe('2026-07-19')
  })

  it('el domingo cuenta como fin de la semana en curso, no como inicio de la siguiente', () => {
    vi.setSystemTime(DOMINGO_12_JULIO_2026)

    const rango = obtenerRangoSemana(0)

    expect(rango.inicio).toBe('2026-07-06')
    expect(rango.fin).toBe('2026-07-12')
  })

  it('offset negativo retrocede semanas completas', () => {
    vi.setSystemTime(MIERCOLES_15_JULIO_2026)

    expect(obtenerRangoSemana(-1)).toMatchObject({ inicio: '2026-07-06', fin: '2026-07-12' })
    expect(obtenerRangoSemana(-2)).toMatchObject({ inicio: '2026-06-29', fin: '2026-07-05' })
  })

  it('offset positivo avanza semanas completas y cruza el cambio de mes', () => {
    vi.setSystemTime(MIERCOLES_15_JULIO_2026)

    expect(obtenerRangoSemana(3)).toMatchObject({ inicio: '2026-08-03', fin: '2026-08-09' })
  })

  it('rellena mes y dia con cero para que la fecha sea comparable como string', () => {
    vi.setSystemTime(new Date(2026, 0, 7, 10, 30))

    const rango = obtenerRangoSemana(0)

    expect(rango.inicio).toBe('2026-01-05')
    expect(rango.fin).toBe('2026-01-11')
  })

  it('la etiqueta nombra ambos extremos del rango', () => {
    vi.setSystemTime(MIERCOLES_15_JULIO_2026)

    const { etiqueta } = obtenerRangoSemana(0)

    expect(etiqueta).toContain('13')
    expect(etiqueta).toContain('19')
    expect(etiqueta).toContain('2026')
  })
})
