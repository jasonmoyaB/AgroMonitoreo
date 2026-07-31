import { describe, expect, it } from 'vitest'
import { construirFilasPlanilla } from '../../../../src/features/planilla/utils/construir-filas-planilla'
import type { SalarioTrabajador } from '../../../../src/shared/types/domain.types'
import type { AsistenciaConTrabajador } from '../../../../src/features/asistencia/types/asistencia.types'
import type { PagoQuincenal } from '../../../../src/features/planilla/types/planilla.types'

const SALARIOS: SalarioTrabajador[] = [
  { trabajadorId: 'a', nombreCompleto: 'Ana', fotoUrl: null, salarioMensual: 400000, moneda: 'colones' },
  { trabajadorId: 'b', nombreCompleto: 'Beto', fotoUrl: null, salarioMensual: 1000, moneda: 'usd' },
]

const FINCA = { valorHora: 1750, valorHoraUsd: 2 }

const PAGO_DE_ANA: PagoQuincenal = {
  id: 'p1',
  trabajadorId: 'a',
  quincenaInicio: '2026-07-16',
  quincenaFin: '2026-07-31',
  monto: 150000,
  montoBruto: 150000,
  diasAusentes: 0,
  moneda: 'colones',
  creadoEn: '2026-07-31T12:00:00Z',
}

function ausencia(trabajadorId: string, fecha: string): AsistenciaConTrabajador {
  return { id: `f-${trabajadorId}-${fecha}`, fecha, trabajadorId, trabajadorNombre: 'x', tipo: 'permisos' }
}

function construir(pagos: PagoQuincenal[] = [], ausencias: AsistenciaConTrabajador[] = [], salarios = SALARIOS) {
  return construirFilasPlanilla({ salarios, pagos, ausencias, finca: FINCA })
}

describe('construirFilasPlanilla', () => {
  it('sin pagos, todas las filas quedan pendientes con el monto calculado', () => {
    const filas = construir()
    expect(filas.map((fila) => fila.montoQuincena)).toEqual([200000, 500])
    expect(filas.every((fila) => fila.pago === null)).toBe(true)
  })

  it('sin ausencias el neto es igual al bruto', () => {
    const filas = construir()
    expect(filas.map((fila) => fila.montoNeto)).toEqual([200000, 500])
    expect(filas.every((fila) => fila.ausencias.length === 0)).toBe(true)
  })

  it('guarda las fechas y el tipo de cada falta, ordenadas cronologicamente', () => {
    const [ana] = construir([], [ausencia('a', '2026-07-09'), ausencia('a', '2026-07-02')])
    expect(ana.ausencias).toEqual([
      { fecha: '2026-07-02', tipo: 'permisos' },
      { fecha: '2026-07-09', tipo: 'permisos' },
    ])
  })

  it('adjunta el pago al trabajador que corresponde y deja al resto pendiente', () => {
    const filas = construir([PAGO_DE_ANA])
    expect(filas[0].pago).toEqual(PAGO_DE_ANA)
    expect(filas[1].pago).toBeNull()
  })

  it('el pago conserva su monto historico aunque el salario haya cambiado despues', () => {
    const [fila] = construir([PAGO_DE_ANA])
    expect(fila.montoQuincena).toBe(200000)
    expect(fila.pago?.monto).toBe(150000)
  })

  it('ignora pagos de trabajadores que ya no estan en la lista', () => {
    const pagoHuerfano = { ...PAGO_DE_ANA, id: 'p2', trabajadorId: 'z' }
    expect(construir([pagoHuerfano]).every((fila) => fila.pago === null)).toBe(true)
  })

  it('sin trabajadores devuelve lista vacia', () => {
    expect(construir([PAGO_DE_ANA], [], [])).toEqual([])
  })

  it('descuenta las ausencias solo al trabajador que falto', () => {
    const [ana, beto] = construir([], [ausencia('a', '2026-07-08'), ausencia('a', '2026-07-09')])
    expect(ana.ausencias.length).toBe(2)
    expect(ana.montoNeto).toBe(172000)
    expect(beto.ausencias.length).toBe(0)
    expect(beto.montoNeto).toBe(500)
  })

  it('el trabajador en usd se descuenta con el valor hora en usd', () => {
    const [, beto] = construir([], [ausencia('b', '2026-07-08')])
    expect(beto.montoNeto).toBe(484)
  })

  it('mas ausencias que quincena no paga en negativo', () => {
    const veinteFaltas = Array.from({ length: 20 }, (_item, indice) => ausencia('a', `2026-07-${String(indice + 1).padStart(2, '0')}`))
    const [ana] = construir([], veinteFaltas)
    expect(ana.ausencias.length).toBe(20)
    expect(ana.montoNeto).toBe(0)
  })

  it('el neto del mes no depende de en que quincena cayeron las faltas', () => {
    const juntas = construir([], [ausencia('a', '2026-07-08'), ausencia('a', '2026-07-09')])[0].montoNeto + construir()[0].montoNeto
    const separadas = construir([], [ausencia('a', '2026-07-08')])[0].montoNeto + construir([], [ausencia('a', '2026-07-20')])[0].montoNeto
    expect(juntas).toBe(372000)
    expect(separadas).toBe(372000)
  })
})
