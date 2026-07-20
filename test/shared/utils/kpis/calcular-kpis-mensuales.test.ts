import { describe, expect, it } from 'vitest'
import type { RegistroTrabajo, TipoLabor, Trabajador } from '../../../../src/shared/types/domain.types'
import { calcularKpisMensuales } from '../../../../src/shared/utils/kpis/calcular-kpis-mensuales'

const TIPOS_LABOR: TipoLabor[] = [
  { id: 'cosecha', codigo: 'cosecha', nombre: 'Cosecha', icono: 'wheat', color: '#000', tieneCantidad: true, unidadMedida: 'cajas', pasoCantidad: 1, orden: 1 },
  { id: 'amarre_1', codigo: 'amarre_1', nombre: 'Amarre 1', icono: 'link', color: '#000', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden: 2 },
]

function registro(tipoLaborId: string, horas: number, cantidad: number | null): RegistroTrabajo {
  return {
    id: 'r1',
    fincaId: 'birrisito',
    trabajadorId: 't1',
    tipoLaborId,
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
  it('suma horas totales y desglosa cantidad/productividad por unidad de medida', () => {
    const kpis = calcularKpisMensuales(
      [registro('cosecha', 8, 40), registro('cosecha', 4, 20), registro('amarre_1', 5, 25)],
      [trabajador('a')],
      TIPOS_LABOR
    )

    expect(kpis.totalHoras).toBe(17)
    expect(kpis.cantidadesPorUnidad).toEqual([
      { unidad: 'cajas', totalCantidad: 60, productividadPromedio: 5 },
      { unidad: 'tramos', totalCantidad: 25, productividadPromedio: 5 },
    ])
  })

  it('trata cantidad null como 0', () => {
    const kpis = calcularKpisMensuales([registro('cosecha', 8, null)], [], TIPOS_LABOR)

    expect(kpis.cantidadesPorUnidad[0].totalCantidad).toBe(0)
  })

  it('evita division por cero cuando no hay horas', () => {
    const kpis = calcularKpisMensuales([], [], TIPOS_LABOR)

    expect(kpis.cantidadesPorUnidad).toEqual([])
  })

  it('cuenta trabajadores activos por longitud del array recibido', () => {
    const kpis = calcularKpisMensuales([], [trabajador('a'), trabajador('b')], TIPOS_LABOR)

    expect(kpis.trabajadoresActivos).toBe(2)
  })
})
