import { describe, expect, it } from 'vitest'
import { describirPeriodoMetricas } from '../../../../src/features/trabajadores/utils/describir-periodo-metricas'

describe('describirPeriodoMetricas', () => {
  it('muestra mes, año y rango cuando las fechas pertenecen al mismo mes', () => {
    expect(describirPeriodoMetricas({ anio: null, fechaInicio: '2026-08-01', fechaFin: '2026-08-18' })).toBe('Agosto 2026 | 01/08/2026 al 18/08/2026')
  })

  it('muestra el rango completo cuando abarca meses distintos', () => {
    expect(describirPeriodoMetricas({ anio: null, fechaInicio: '2026-07-20', fechaFin: '2026-08-18' })).toBe('20/07/2026 al 18/08/2026')
  })

  it('muestra los filtros parciales de fecha', () => {
    expect(describirPeriodoMetricas({ anio: null, fechaInicio: '2026-08-01', fechaFin: null })).toBe('Desde 01/08/2026')
    expect(describirPeriodoMetricas({ anio: null, fechaInicio: null, fechaFin: '2026-08-18' })).toBe('Hasta 18/08/2026')
  })

  it('muestra el año o todo el historial cuando no existe un rango', () => {
    expect(describirPeriodoMetricas({ anio: 2026, fechaInicio: null, fechaFin: null })).toBe('Año 2026')
    expect(describirPeriodoMetricas({ anio: null, fechaInicio: null, fechaFin: null })).toBe('Todo el historial')
  })
})
