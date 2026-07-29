import { afterEach, describe, expect, it, vi } from 'vitest'
import type { RegistroTrabajo } from '../../../../src/shared/types/domain.types'
import { filtrarRegistrosDelMes } from '../../../../src/shared/utils/kpis/filtrar-registros-del-mes'

function registro(fecha: string): RegistroTrabajo {
  return { id: fecha, fincaId: 'birrisito', trabajadorId: 't1', tipoLaborId: 'cosecha', fecha, horas: 8, cantidad: 1, registradoPor: 'u1', createdAt: `${fecha}T12:00:00Z` }
}

const REGISTROS = [registro('2026-06-30'), registro('2026-07-01'), registro('2026-07-31'), registro('2026-08-01')]

function fechas(registros: readonly RegistroTrabajo[]): string[] {
  return registros.map((registro) => registro.fecha)
}

describe('filtrarRegistrosDelMes', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('deja solo los del mes pedido, incluidos primero y ultimo dia', () => {
    expect(fechas(filtrarRegistrosDelMes(REGISTROS, '2026-07'))).toEqual(['2026-07-01', '2026-07-31'])
  })

  it('no confunde el mismo mes de otro anio', () => {
    expect(filtrarRegistrosDelMes(REGISTROS, '2025-07')).toEqual([])
  })

  it('sin mes explicito usa el mes en curso', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-15T12:00:00Z'))

    expect(fechas(filtrarRegistrosDelMes(REGISTROS))).toEqual(['2026-08-01'])
  })

  // 31/07 20:00 en Costa Rica (UTC-6) = 01/08 02:00 UTC. Con toISOString() el mes en
  // curso pasaba a agosto y los KPIs mensuales de supervisor y admin se iban a cero
  // las ultimas 6 horas de cada mes.
  it('la ultima noche del mes sigue en el mes local, no en el mes UTC', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-01T02:00:00Z'))

    expect(fechas(filtrarRegistrosDelMes(REGISTROS))).toEqual(['2026-07-01', '2026-07-31'])
  })
})
