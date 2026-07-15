import { describe, expect, it } from 'vitest'
import type { RegistroTrabajo, TipoLabor } from '../../../../src/shared/types/domain.types'
import { calcularMetricasPorLabor } from '../../../../src/features/trabajadores/utils/calcular-metricas-por-labor'

function registro(tipoLaborId: string, fecha: string, horas: number, cantidad: number, createdAt: string): RegistroTrabajo {
  return { id: `${tipoLaborId}-${fecha}`, fincaId: 'birrisito', trabajadorId: 't1', tipoLaborId, fecha, horas, cantidad, registradoPor: 'u1', createdAt }
}

function tipoLabor(id: string): TipoLabor {
  return { id, codigo: id, nombre: id, icono: 'leaf', color: '#000', tieneCantidad: false, unidadMedida: null, pasoCantidad: 1, orden: 1 }
}

const TIPOS_LABOR_TEST: readonly TipoLabor[] = [tipoLabor('cosecha'), tipoLabor('amarre_1'), tipoLabor('palea'), tipoLabor('deshija')]

describe('calcularMetricasPorLabor', () => {
  it('reparte horasExtra y cantidadExtra por labor segun el orden en que se cargaron, cruzando la jornada normal del dia (caso real Alvin Alcantara)', () => {
    const registrosDelDia = [
      registro('cosecha', '2026-07-13', 7.5, 3, '2026-07-13T16:20:15Z'),
      registro('amarre_1', '2026-07-13', 5, 15, '2026-07-13T16:58:59Z'),
      registro('palea', '2026-07-13', 2, 2, '2026-07-13T17:55:48Z'),
      registro('deshija', '2026-07-13', 3, 3, '2026-07-13T18:09:52Z'),
    ]

    const metricas = calcularMetricasPorLabor(registrosDelDia, TIPOS_LABOR_TEST)
    const porLabor = Object.fromEntries(metricas.map((metrica) => [metrica.tipoLaborId, metrica]))

    expect(porLabor.cosecha.horasExtra).toBe(0)
    expect(porLabor.cosecha.cantidadExtra).toBe(0)
    // amarre_1: 5h/15 tramos, 4.5h extra -> 15 * 4.5/5 = 13.5 -> redondeado a 14 tramos (sin decimales)
    expect(porLabor.amarre_1.horasExtra).toBe(4.5)
    expect(porLabor.amarre_1.cantidadExtra).toBe(14)
    expect(porLabor.palea.horasExtra).toBe(2)
    expect(porLabor.palea.cantidadExtra).toBe(2)
    expect(porLabor.deshija.horasExtra).toBe(3)
    expect(porLabor.deshija.cantidadExtra).toBe(3)
  })
})
