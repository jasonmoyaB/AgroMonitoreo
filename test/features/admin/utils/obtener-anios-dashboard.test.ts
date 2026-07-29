import { describe, expect, it, vi, afterEach } from 'vitest'

import { obtenerAniosDashboard } from '../../../../src/features/admin/utils/obtener-anios-dashboard'
import type { RegistroTrabajo } from '../../../../src/shared/types/domain.types'

function registroEnFecha(fecha: string): RegistroTrabajo {
  return { fecha } as RegistroTrabajo
}

function fijarAnio(anio: number) {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(`${anio}-06-15T12:00:00`))
}

afterEach(() => vi.useRealTimers())

describe('obtenerAniosDashboard', () => {
  it('incluye el anio actual aunque no haya registros', () => {
    fijarAnio(2026)
    expect(obtenerAniosDashboard([])).toEqual([2026])
  })

  it('no duplica el anio actual y ordena de mas nuevo a mas viejo', () => {
    fijarAnio(2026)
    const registros = [registroEnFecha('2024-03-01'), registroEnFecha('2026-01-10'), registroEnFecha('2025-12-31')]
    expect(obtenerAniosDashboard(registros)).toEqual([2026, 2025, 2024])
  })

  it('agrega el anio nuevo al pasar el tiempo sin perder los anteriores', () => {
    fijarAnio(2028)
    expect(obtenerAniosDashboard([registroEnFecha('2026-05-05')])).toEqual([2028, 2026])
  })
})
