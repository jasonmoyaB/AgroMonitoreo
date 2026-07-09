import { describe, expect, it } from 'vitest'
import type { RegistroTrabajo, Trabajador } from '../../../../src/shared/types/domain.types'
import { calcularKpisMensuales } from '../../../../src/features/supervisor/utils/calcular-kpis-mensuales'

function registro(horas: number, cantidad: number | null): RegistroTrabajo {
  return {
    id: 'r1',
    fincaId: 'birrisito',
    trabajadorId: 't1',
    tipoLaborId: 'cosecha',
    fecha: '2026-07-01',
    horas,
    cantidad,
    registradoPor: 'u1',
    createdAt: '2026-07-01T00:00:00Z',
  }
}

function trabajador(id: string): Trabajador {
  return { id, fincaId: 'birrisito', nombreCompleto: id, fotoUrl: null, activo: true }
}

describe('calcularKpisMensuales', () => {
  it('suma horas y cantidad, calcula productividad', () => {
    const kpis = calcularKpisMensuales([registro(8, 40), registro(4, 20)], [trabajador('a')])

    expect(kpis.totalHoras).toBe(12)
    expect(kpis.totalCantidad).toBe(60)
    expect(kpis.productividadPromedio).toBe(5)
  })

  it('trata cantidad null como 0', () => {
    const kpis = calcularKpisMensuales([registro(8, null)], [])

    expect(kpis.totalCantidad).toBe(0)
  })

  it('evita division por cero cuando no hay horas', () => {
    const kpis = calcularKpisMensuales([], [])

    expect(kpis.productividadPromedio).toBe(0)
  })

  it('cuenta trabajadores activos por longitud del array recibido', () => {
    const kpis = calcularKpisMensuales([], [trabajador('a'), trabajador('b')])

    expect(kpis.trabajadoresActivos).toBe(2)
  })
})
