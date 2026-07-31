import { describe, expect, it } from 'vitest'
import type { TrabajadorNombrable } from '../../../../src/shared/types/domain.types'
import { RANGOS_ALFABETO } from '../../../../src/features/captura/constants/rangos-alfabeto.constants'
import { encontrarPrimerTrabajadorPorRango } from '../../../../src/features/captura/utils/encontrar-primer-trabajador-por-rango'

function trabajador(nombreCompleto: string): TrabajadorNombrable {
  return { id: nombreCompleto, nombreCompleto }
}

const [A_F, G_M, N_S, T_Z] = RANGOS_ALFABETO

const ORDENADOS = [trabajador('Alvin Alcantara'), trabajador('Carlos Mora'), trabajador('Maria Rojas'), trabajador('Pedro Sanchez')]

describe('encontrarPrimerTrabajadorPorRango', () => {
  it('devuelve el primero de la lista cuya inicial cae en el rango', () => {
    expect(encontrarPrimerTrabajadorPorRango(ORDENADOS, A_F)?.nombreCompleto).toBe('Alvin Alcantara')
    expect(encontrarPrimerTrabajadorPorRango(ORDENADOS, G_M)?.nombreCompleto).toBe('Maria Rojas')
    expect(encontrarPrimerTrabajadorPorRango(ORDENADOS, N_S)?.nombreCompleto).toBe('Pedro Sanchez')
  })

  it('devuelve undefined si nadie cae en el rango', () => {
    expect(encontrarPrimerTrabajadorPorRango(ORDENADOS, T_Z)).toBeUndefined()
  })

  it('los extremos del rango son inclusivos', () => {
    expect(encontrarPrimerTrabajadorPorRango([trabajador('Fabian Ruiz')], A_F)?.nombreCompleto).toBe('Fabian Ruiz')
    expect(encontrarPrimerTrabajadorPorRango([trabajador('Gerardo Ruiz')], G_M)?.nombreCompleto).toBe('Gerardo Ruiz')
  })

  it('acepta nombres en minuscula o con espacios al inicio', () => {
    expect(encontrarPrimerTrabajadorPorRango([trabajador('  ana lopez')], A_F)?.nombreCompleto).toBe('  ana lopez')
  })

  it('lista vacia devuelve undefined', () => {
    expect(encontrarPrimerTrabajadorPorRango([], A_F)).toBeUndefined()
  })
})
