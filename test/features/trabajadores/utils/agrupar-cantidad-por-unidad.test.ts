import { describe, expect, it } from 'vitest'
import type { MetricaPorLabor } from '../../../../src/features/trabajadores/types/trabajador-metricas.types'
import { agruparCantidadPorUnidad } from '../../../../src/features/trabajadores/utils/agrupar-cantidad-por-unidad'

function metrica(tipoLaborId: string, cantidad: number, unidadMedida: string | null): MetricaPorLabor {
  return { tipoLaborId, nombre: tipoLaborId, horas: 1, horasExtra: 0, cantidad, cantidadExtra: 0, productividad: 0, unidadMedida }
}

describe('agruparCantidadPorUnidad', () => {
  it('suma la cantidad por unidad de medida en vez de mezclar cajas y tramos en un solo total', () => {
    const metricas = [metrica('cosecha', 44, 'cajas'), metrica('amarre_1', 8, 'tramos'), metrica('deshija', 4, 'tramos')]

    const resultado = agruparCantidadPorUnidad(metricas)

    expect(resultado).toEqual([
      { unidadMedida: 'cajas', cantidad: 44 },
      { unidadMedida: 'tramos', cantidad: 12 },
    ])
  })

  it('ignora labores sin unidad de medida o sin cantidad', () => {
    const metricas = [metrica('cosecha', 0, 'cajas'), metrica('otra', 5, null)]

    expect(agruparCantidadPorUnidad(metricas)).toEqual([])
  })
})
