import { describe, expect, it } from 'vitest'
import { obtenerEspaciosCalendario } from '../../../../src/features/asistencia/utils/obtener-espacios-calendario'

describe('obtenerEspaciosCalendario', () => {
  it('cuenta los huecos antes del dia 1 en una grilla que empieza en lunes', () => {
    // 1 de julio 2026 cae miercoles: lunes y martes quedan vacios
    expect(obtenerEspaciosCalendario(2026, 7)).toBe(2)
  })

  it('un mes que empieza lunes no deja huecos', () => {
    // 1 de junio 2026 cae lunes
    expect(obtenerEspaciosCalendario(2026, 6)).toBe(0)
  })

  it('un mes que empieza domingo deja la fila completa, no un hueco negativo', () => {
    // 1 de febrero 2026 cae domingo: getDay() 0 seria -1 sin el caso especial
    expect(obtenerEspaciosCalendario(2026, 2)).toBe(6)
  })

  it('el mes se recibe 1-indexado', () => {
    // 1 de enero 2026 cae jueves
    expect(obtenerEspaciosCalendario(2026, 1)).toBe(3)
  })
})
