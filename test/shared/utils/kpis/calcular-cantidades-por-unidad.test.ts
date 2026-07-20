import { describe, expect, it } from 'vitest'
import type { RegistroTrabajo, TipoLabor } from '../../../../src/shared/types/domain.types'
import { calcularCantidadesPorUnidad } from '../../../../src/shared/utils/kpis/calcular-cantidades-por-unidad'

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

describe('calcularCantidadesPorUnidad', () => {
  it('no mezcla cajas con tramos entre labores distintas', () => {
    const resultado = calcularCantidadesPorUnidad(
      [registro('cosecha', 8, 40), registro('amarre_1', 4, 20)],
      TIPOS_LABOR
    )

    expect(resultado).toEqual([
      { unidad: 'cajas', totalCantidad: 40, productividadPromedio: 5 },
      { unidad: 'tramos', totalCantidad: 20, productividadPromedio: 5 },
    ])
  })

  it('ignora registros de una labor sin unidad de medida', () => {
    const tiposSinUnidad: TipoLabor[] = [{ ...TIPOS_LABOR[0], unidadMedida: null }]

    const resultado = calcularCantidadesPorUnidad([registro('cosecha', 8, 40)], tiposSinUnidad)

    expect(resultado).toEqual([])
  })

  it('devuelve array vacio sin registros', () => {
    expect(calcularCantidadesPorUnidad([], TIPOS_LABOR)).toEqual([])
  })
})
