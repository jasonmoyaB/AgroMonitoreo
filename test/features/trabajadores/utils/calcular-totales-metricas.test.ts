import { describe, expect, it } from 'vitest'
import type { RegistroTrabajo } from '../../../../src/shared/types/domain.types'
import { calcularTotalesMetricas } from '../../../../src/features/trabajadores/utils/calcular-totales-metricas'

function registro(tipoLaborId: string, fecha: string, horas: number): RegistroTrabajo {
  return {
    id: `${tipoLaborId}-${fecha}`,
    fincaId: 'birrisito',
    trabajadorId: 't1',
    tipoLaborId,
    fecha,
    horas,
    cantidad: 0,
    registradoPor: 'u1',
    createdAt: `${fecha}T00:00:00Z`,
  }
}

describe('calcularTotalesMetricas', () => {
  it('cuenta como extra las horas de una sola labor que superan la jornada normal', () => {
    const totales = calcularTotalesMetricas([registro('amarre_3', '2026-07-09', 13)])

    expect(totales.horasExtra).toBe(5)
  })

  it('cuenta las horas extra cuando la suma de varias labores del mismo dia supera la jornada, aunque ninguna por si sola la supere', () => {
    const registrosDelDia = [
      registro('cosecha', '2026-07-13', 7.5),
      registro('amarre_1', '2026-07-13', 5),
      registro('palea', '2026-07-13', 2),
    ]

    const totales = calcularTotalesMetricas(registrosDelDia)

    expect(totales.horasExtra).toBe(6.5)
  })

  it('no marca horas extra si la suma del dia no supera la jornada normal', () => {
    const totales = calcularTotalesMetricas([registro('cosecha', '2026-07-13', 4), registro('palea', '2026-07-13', 3)])

    expect(totales.horasExtra).toBe(0)
  })
})
