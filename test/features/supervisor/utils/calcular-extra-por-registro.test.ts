import { describe, expect, it } from 'vitest'
import type { RegistroTrabajo } from '../../../../src/shared/types/domain.types'
import { calcularExtraPorRegistro } from '../../../../src/features/supervisor/utils/calcular-extra-por-registro'

function registro(id: string, fecha: string, horas: number, cantidad: number, createdAt: string): RegistroTrabajo {
  return { id, fincaId: 'birrisito', trabajadorId: 't1', tipoLaborId: id, fecha, horas, cantidad, registradoPor: 'u1', createdAt }
}

describe('calcularExtraPorRegistro', () => {
  it('reparte horas y cantidad por hora exacta cuando una fila cruza la jornada a mitad de camino (caso real Alvin Alcantara)', () => {
    const registros = [
      registro('cosecha', '2026-07-13', 7.5, 3, '2026-07-13T16:20:15Z'),
      registro('amarre_1', '2026-07-13', 5, 15, '2026-07-13T16:58:59Z'),
      registro('palea', '2026-07-13', 2, 2, '2026-07-13T17:55:48Z'),
      registro('deshija', '2026-07-13', 3, 3, '2026-07-13T18:09:52Z'),
    ]

    const extra = calcularExtraPorRegistro(registros)

    expect(extra.get('cosecha')).toBeUndefined()
    // amarre_1: 5h, 15 tramos, 4.5h de esas 5h son extra -> 15 * 4.5/5 = 13.5 -> redondeado a 14 tramos (sin decimales)
    expect(extra.get('amarre_1')).toEqual({ horasExtra: 4.5, cantidadExtra: 14 })
    // palea entera cae despues del limite -> toda su cantidad es extra, ya es entero
    expect(extra.get('palea')).toEqual({ horasExtra: 2, cantidadExtra: 2 })
  })

  it('no reparte nada si el acumulado del dia queda exactamente en la jornada normal (caso real Hector Dias)', () => {
    const registros = [registro('palea', '2026-07-13', 6, 5, '2026-07-13T18:20:17Z'), registro('cosecha', '2026-07-13', 2, 2, '2026-07-13T18:27:45Z')]

    expect(calcularExtraPorRegistro(registros).size).toBe(0)
  })

  it('trata cantidad null como 0 al prorratear', () => {
    const registros = [registro('amarre_3', '2026-07-09', 13, 0, '2026-07-09T18:04:11Z')]

    expect(calcularExtraPorRegistro(registros).get('amarre_3')).toEqual({ horasExtra: 5, cantidadExtra: 0 })
  })
})
