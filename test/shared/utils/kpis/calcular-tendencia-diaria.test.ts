import { describe, expect, it } from 'vitest'
import type { RegistroTrabajo } from '../../../../src/shared/types/domain.types'
import { calcularTendenciaDiaria } from '../../../../src/shared/utils/kpis/calcular-tendencia-diaria'

function registro(fecha: string, cantidad: number | null): RegistroTrabajo {
  return {
    id: 'r1',
    fincaId: 'birrisito',
    trabajadorId: 't1',
    tipoLaborId: 'cosecha',
    fecha,
    horas: 8,
    cantidad,
    registradoPor: 'u1',
    createdAt: `${fecha}T00:00:00Z`,
  }
}

describe('calcularTendenciaDiaria', () => {
  it('agrupa y suma cantidad por fecha', () => {
    const tendencia = calcularTendenciaDiaria([registro('2026-07-01', 10), registro('2026-07-01', 5)])

    expect(tendencia).toEqual([{ fecha: '2026-07-01', valor: 15 }])
  })

  it('trata cantidad null como 0', () => {
    const tendencia = calcularTendenciaDiaria([registro('2026-07-01', null)])

    expect(tendencia).toEqual([{ fecha: '2026-07-01', valor: 0 }])
  })

  it('ordena por fecha ascendente sin importar el orden de entrada', () => {
    const tendencia = calcularTendenciaDiaria([registro('2026-07-03', 1), registro('2026-07-01', 1), registro('2026-07-02', 1)])

    expect(tendencia.map((p) => p.fecha)).toEqual(['2026-07-01', '2026-07-02', '2026-07-03'])
  })
})
