import { describe, expect, it } from 'vitest'
import type { RegistroTrabajo } from '../../../../src/shared/types/domain.types'
import type { TrabajadorMetricasFiltros } from '../../../../src/features/trabajadores/types/trabajador-metricas.types'
import { filtrarRegistrosTrabajador } from '../../../../src/features/trabajadores/utils/filtrar-registros-trabajador'

function registro(id: string, trabajadorId: string, fecha: string): RegistroTrabajo {
  return { id, fincaId: 'birrisito', trabajadorId, tipoLaborId: 'cosecha', fecha, horas: 8, cantidad: 10, registradoPor: 'u1', createdAt: `${fecha}T12:00:00Z` }
}

const SIN_FILTROS: TrabajadorMetricasFiltros = { anio: null, fechaInicio: null, fechaFin: null }

const REGISTROS: readonly RegistroTrabajo[] = [
  registro('r1', 't1', '2025-12-31'),
  registro('r2', 't1', '2026-01-15'),
  registro('r3', 't1', '2026-07-10'),
  registro('r4', 't2', '2026-07-10'),
]

function ids(registros: readonly RegistroTrabajo[]): string[] {
  return registros.map((registro) => registro.id)
}

describe('filtrarRegistrosTrabajador', () => {
  it('descarta los registros de otros trabajadores', () => {
    expect(ids(filtrarRegistrosTrabajador(REGISTROS, 't2', SIN_FILTROS))).toEqual(['r4'])
  })

  it('sin filtros devuelve todo lo del trabajador', () => {
    expect(ids(filtrarRegistrosTrabajador(REGISTROS, 't1', SIN_FILTROS))).toEqual(['r1', 'r2', 'r3'])
  })

  it('filtra por anio', () => {
    expect(ids(filtrarRegistrosTrabajador(REGISTROS, 't1', { ...SIN_FILTROS, anio: 2026 }))).toEqual(['r2', 'r3'])
  })

  it('el rango de fechas incluye los extremos', () => {
    const filtros: TrabajadorMetricasFiltros = { anio: null, fechaInicio: '2026-01-15', fechaFin: '2026-07-10' }

    expect(ids(filtrarRegistrosTrabajador(REGISTROS, 't1', filtros))).toEqual(['r2', 'r3'])
  })

  it('fechaInicio sin fechaFin deja abierto el extremo superior', () => {
    const filtros: TrabajadorMetricasFiltros = { anio: null, fechaInicio: '2026-01-16', fechaFin: null }

    expect(ids(filtrarRegistrosTrabajador(REGISTROS, 't1', filtros))).toEqual(['r3'])
  })

  it('anio y rango se aplican juntos', () => {
    const filtros: TrabajadorMetricasFiltros = { anio: 2026, fechaInicio: null, fechaFin: '2026-01-31' }

    expect(ids(filtrarRegistrosTrabajador(REGISTROS, 't1', filtros))).toEqual(['r2'])
  })

  it('anio 0 se trata como filtro real, no como ausencia de filtro', () => {
    expect(filtrarRegistrosTrabajador(REGISTROS, 't1', { ...SIN_FILTROS, anio: 0 })).toEqual([])
  })
})
