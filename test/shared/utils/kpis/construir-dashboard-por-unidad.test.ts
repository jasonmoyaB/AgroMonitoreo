import { describe, expect, it } from 'vitest'
import { construirDashboardPorUnidad } from '../../../../src/shared/utils/kpis/construir-dashboard-por-unidad'
import type { RegistroTrabajo, TipoLabor, Trabajador } from '../../../../src/shared/types/domain.types'

const TIPOS_LABOR = [
  { id: 'cosecha', nombre: 'Cosecha', unidadMedida: 'cajas' },
  { id: 'amarre_1', nombre: 'Amarre 1', unidadMedida: 'tramos' },
  { id: 'sin_unidad', nombre: 'Sin unidad', unidadMedida: null },
] as unknown as readonly TipoLabor[]

const TRABAJADORES = [
  { id: 't1', nombreCompleto: 'Ana Vega' },
  { id: 't2', nombreCompleto: 'Jose Mora' },
] as unknown as readonly Trabajador[]

function registro(tipoLaborId: string, trabajadorId: string, cantidad: number, fecha = '2026-08-03'): RegistroTrabajo {
  return { id: `${tipoLaborId}-${trabajadorId}-${fecha}`, tipoLaborId, trabajadorId, fecha, horas: 8, cantidad } as unknown as RegistroTrabajo
}

const REGISTROS = [registro('cosecha', 't1', 100), registro('amarre_1', 't1', 30), registro('amarre_1', 't2', 70), registro('sin_unidad', 't2', 999)]

function construir(registros: readonly RegistroTrabajo[] = REGISTROS) {
  return construirDashboardPorUnidad({ periodo: '2026-08', registros, trabajadores: TRABAJADORES, tiposLabor: TIPOS_LABOR })
}

describe('construirDashboardPorUnidad', () => {
  it('separa cajas de tramos en vez de sumarlos en un total sin unidad', () => {
    const bloques = construir()

    expect(bloques.map((bloque) => bloque.unidad)).toEqual(['cajas', 'tramos'])
    expect(bloques[0].produccionDiaria.total).toBe(100)
    expect(bloques[1].produccionDiaria.total).toBe(100)
  })

  it('rankea trabajadores dentro de su unidad, no cruzando unidades', () => {
    const tramos = construir().find((bloque) => bloque.unidad === 'tramos')

    expect(tramos?.rankingTrabajadores.map((item) => item.etiqueta)).toEqual(['Jose Mora', 'Ana Vega'])
  })

  it('ignora las labores sin unidad de medida', () => {
    expect(construir().some((bloque) => bloque.produccionDiaria.total === 999)).toBe(false)
  })

  it('ordena los bloques por el orden de las labores y no por el de llegada de los registros', () => {
    const bloques = construir([registro('amarre_1', 't1', 30), registro('cosecha', 't1', 100)])

    expect(bloques.map((bloque) => bloque.unidad)).toEqual(['cajas', 'tramos'])
  })

  it('devuelve una lista vacía cuando el mes no tiene registros', () => {
    expect(construir([])).toEqual([])
  })
})
