import { describe, expect, it } from 'vitest'
import { construirFilasPlanilla } from '../../../../src/features/planilla/utils/construir-filas-planilla'
import type { SalarioTrabajador } from '../../../../src/shared/types/domain.types'
import type { PagoQuincenal } from '../../../../src/features/planilla/types/planilla.types'

const SALARIOS: SalarioTrabajador[] = [
  { trabajadorId: 'a', nombreCompleto: 'Ana', fotoUrl: null, salarioMensual: 400000, moneda: 'colones' },
  { trabajadorId: 'b', nombreCompleto: 'Beto', fotoUrl: null, salarioMensual: 1000, moneda: 'usd' },
]

const PAGO_DE_ANA: PagoQuincenal = {
  id: 'p1',
  trabajadorId: 'a',
  quincenaInicio: '2026-07-16',
  quincenaFin: '2026-07-31',
  monto: 150000,
  moneda: 'colones',
  creadoEn: '2026-07-31T12:00:00Z',
}

describe('construirFilasPlanilla', () => {
  it('sin pagos, todas las filas quedan pendientes con el monto calculado', () => {
    const filas = construirFilasPlanilla(SALARIOS, [])
    expect(filas.map((fila) => fila.montoQuincena)).toEqual([200000, 500])
    expect(filas.every((fila) => fila.pago === null)).toBe(true)
  })

  it('adjunta el pago al trabajador que corresponde y deja al resto pendiente', () => {
    const filas = construirFilasPlanilla(SALARIOS, [PAGO_DE_ANA])
    expect(filas[0].pago).toEqual(PAGO_DE_ANA)
    expect(filas[1].pago).toBeNull()
  })

  it('el pago conserva su monto historico aunque el salario haya cambiado despues', () => {
    const [fila] = construirFilasPlanilla(SALARIOS, [PAGO_DE_ANA])
    expect(fila.montoQuincena).toBe(200000)
    expect(fila.pago?.monto).toBe(150000)
  })

  it('ignora pagos de trabajadores que ya no estan en la lista', () => {
    const pagoHuerfano = { ...PAGO_DE_ANA, id: 'p2', trabajadorId: 'z' }
    expect(construirFilasPlanilla(SALARIOS, [pagoHuerfano]).every((fila) => fila.pago === null)).toBe(true)
  })

  it('sin trabajadores devuelve lista vacia', () => {
    expect(construirFilasPlanilla([], [PAGO_DE_ANA])).toEqual([])
  })
})
