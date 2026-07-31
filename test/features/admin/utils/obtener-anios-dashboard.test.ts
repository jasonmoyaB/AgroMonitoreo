import { describe, expect, it, vi, afterEach } from 'vitest'

import { obtenerAniosDashboard } from '../../../../src/features/admin/utils/obtener-anios-dashboard'

function fijarAnio(anio: number) {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(`${anio}-06-15T12:00:00`))
}

afterEach(() => vi.useRealTimers())

describe('obtenerAniosDashboard', () => {
  it('devuelve solo el anio actual cuando no hay registros', () => {
    fijarAnio(2026)
    expect(obtenerAniosDashboard(null)).toEqual([2026])
  })

  it('cubre sin huecos desde el primer registro hasta hoy, del mas nuevo al mas viejo', () => {
    fijarAnio(2026)
    expect(obtenerAniosDashboard(2023)).toEqual([2026, 2025, 2024, 2023])
  })

  it('agrega el anio nuevo al pasar el tiempo sin perder los anteriores', () => {
    fijarAnio(2028)
    expect(obtenerAniosDashboard(2026)).toEqual([2028, 2027, 2026])
  })

  it('ignora un primer registro con fecha futura en vez de devolver una lista vacia', () => {
    fijarAnio(2026)
    expect(obtenerAniosDashboard(2030)).toEqual([2026])
  })
})
