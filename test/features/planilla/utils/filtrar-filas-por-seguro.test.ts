import { describe, expect, it } from 'vitest'
import { filtrarFilasPorSeguro } from '../../../../src/features/planilla/utils/filtrar-filas-por-seguro'
import type { FilaPlanilla } from '../../../../src/features/planilla/types/planilla.types'

function fila(nombreCompleto: string, asegurado: boolean): FilaPlanilla {
  return {
    trabajadorId: nombreCompleto,
    nombreCompleto,
    fotoUrl: null,
    asegurado,
    salarioMensual: 400000,
    moneda: 'colones',
    montoSemanal: 100000,
    montoQuincena: 200000,
    ausencias: [],
    montoNeto: 200000,
    pago: null,
  }
}

const ALVIN = fila('Alvin', true)
const MARIA = fila('Maria', false)
const PEDRO = fila('Pedro', true)
const FILAS: readonly FilaPlanilla[] = [ALVIN, MARIA, PEDRO]

describe('filtrarFilasPorSeguro', () => {
  it('asegurados devuelve solo los que tienen seguro', () => {
    expect(filtrarFilasPorSeguro(FILAS, 'asegurados')).toEqual([ALVIN, PEDRO])
  })

  it('no_asegurados devuelve solo los que no tienen seguro', () => {
    expect(filtrarFilasPorSeguro(FILAS, 'no_asegurados')).toEqual([MARIA])
  })

  // lo unico no obvio: ninguna fila se pierde ni se paga dos veces entre las dos tandas
  it('cada fila cae en un grupo y solo uno', () => {
    const asegurados = filtrarFilasPorSeguro(FILAS, 'asegurados')
    const noAsegurados = filtrarFilasPorSeguro(FILAS, 'no_asegurados')
    expect(asegurados.length + noAsegurados.length).toBe(FILAS.length)
  })
})
