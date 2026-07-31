import { describe, expect, it } from 'vitest'
import type { RegistroTrabajo, Trabajador } from '../../../../src/shared/types/domain.types'
import { calcularRankingTrabajadores } from '../../../../src/shared/utils/kpis/calcular-ranking-trabajadores'

function trabajador(id: string): Trabajador {
  return { id, fincaId: 'birrisito', nombreCompleto: `Trabajador ${id}`, fotoUrl: null, activo: true }
}

function registro(trabajadorId: string, cantidad: number | null): RegistroTrabajo {
  return { id: `${trabajadorId}-${cantidad}`, fincaId: 'birrisito', trabajadorId, tipoLaborId: 'cosecha', fecha: '2026-07-10', horas: 8, cantidad, registradoPor: 'u1', createdAt: '2026-07-10T12:00:00Z' }
}

describe('calcularRankingTrabajadores', () => {
  it('suma por trabajador y ordena de mayor a menor', () => {
    const trabajadores = [trabajador('t1'), trabajador('t2')]
    const registros = [registro('t1', 5), registro('t2', 20), registro('t1', 4)]

    expect(calcularRankingTrabajadores(registros, trabajadores)).toEqual([
      { id: 't2', etiqueta: 'Trabajador t2', valor: 20 },
      { id: 't1', etiqueta: 'Trabajador t1', valor: 9 },
    ])
  })

  it('corta en los cinco primeros', () => {
    const trabajadores = ['t1', 't2', 't3', 't4', 't5', 't6', 't7'].map(trabajador)
    const registros = trabajadores.map((item, indice) => registro(item.id, indice + 1))

    const ranking = calcularRankingTrabajadores(registros, trabajadores)

    expect(ranking).toHaveLength(5)
    expect(ranking.map((item) => item.id)).toEqual(['t7', 't6', 't5', 't4', 't3'])
  })

  it('omite a los trabajadores sin produccion', () => {
    const trabajadores = [trabajador('t1'), trabajador('t2')]

    expect(calcularRankingTrabajadores([registro('t1', 3)], trabajadores).map((item) => item.id)).toEqual(['t1'])
  })

  it('trata cantidad null como cero', () => {
    expect(calcularRankingTrabajadores([registro('t1', null)], [trabajador('t1')])).toEqual([])
  })

  it('ignora registros de trabajadores fuera de la lista (otra finca)', () => {
    expect(calcularRankingTrabajadores([registro('ajeno', 50)], [trabajador('t1')])).toEqual([])
  })
})
