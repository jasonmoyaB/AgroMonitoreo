import { describe, expect, it } from 'vitest'
import type { RegistroTrabajo, TipoLabor } from '../../../../src/shared/types/domain.types'
import { calcularRankingLabores } from '../../../../src/shared/utils/kpis/calcular-ranking-labores'

function tipoLabor(id: string, nombre: string): TipoLabor {
  return { id, codigo: id, nombre, icono: 'leaf', color: '#000', tieneCantidad: true, unidadMedida: 'cajas', pasoCantidad: 1, orden: 1 }
}

function registro(tipoLaborId: string, cantidad: number | null): RegistroTrabajo {
  return { id: `${tipoLaborId}-${cantidad}`, fincaId: 'birrisito', trabajadorId: 't1', tipoLaborId, fecha: '2026-07-10', horas: 8, cantidad, registradoPor: 'u1', createdAt: '2026-07-10T12:00:00Z' }
}

const TIPOS = [tipoLabor('cosecha', 'Cosecha'), tipoLabor('palea', 'Palea'), tipoLabor('deshija', 'Deshija')]

describe('calcularRankingLabores', () => {
  it('suma las cantidades por labor y ordena de mayor a menor', () => {
    const registros = [registro('cosecha', 10), registro('palea', 30), registro('cosecha', 5)]

    expect(calcularRankingLabores(registros, TIPOS)).toEqual([
      { id: 'palea', etiqueta: 'Palea', valor: 30 },
      { id: 'cosecha', etiqueta: 'Cosecha', valor: 15 },
    ])
  })

  it('omite las labores sin produccion en vez de mostrarlas en cero', () => {
    const ranking = calcularRankingLabores([registro('cosecha', 10)], TIPOS)

    expect(ranking.map((item) => item.id)).toEqual(['cosecha'])
  })

  it('trata cantidad null (labor sin unidad) como cero', () => {
    expect(calcularRankingLabores([registro('palea', null)], TIPOS)).toEqual([])
  })

  it('ignora registros de labores que no estan en el catalogo', () => {
    expect(calcularRankingLabores([registro('labor_borrada', 99)], TIPOS)).toEqual([])
  })

  it('sin registros devuelve lista vacia', () => {
    expect(calcularRankingLabores([], TIPOS)).toEqual([])
  })
})
