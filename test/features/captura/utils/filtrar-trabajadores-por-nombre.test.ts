import { describe, expect, it } from 'vitest'
import type { TrabajadorNombrable } from '../../../../src/shared/types/domain.types'
import { filtrarTrabajadoresPorNombre } from '../../../../src/features/captura/utils/filtrar-trabajadores-por-nombre'

function trabajador(nombreCompleto: string): TrabajadorNombrable {
  return { id: nombreCompleto, nombreCompleto }
}

const TRABAJADORES = [trabajador('Alvin Alcantara'), trabajador('Maria Rojas'), trabajador('Pedro Mora')]

function nombres(trabajadores: readonly TrabajadorNombrable[]): string[] {
  return trabajadores.map((trabajador) => trabajador.nombreCompleto)
}

describe('filtrarTrabajadoresPorNombre', () => {
  it('texto vacio devuelve la lista completa', () => {
    expect(nombres(filtrarTrabajadoresPorNombre(TRABAJADORES, ''))).toEqual(nombres(TRABAJADORES))
  })

  it('texto de solo espacios cuenta como vacio', () => {
    expect(filtrarTrabajadoresPorNombre(TRABAJADORES, '   ')).toHaveLength(3)
  })

  it('ignora mayusculas y espacios sobrantes', () => {
    expect(nombres(filtrarTrabajadoresPorNombre(TRABAJADORES, ' MARIA '))).toEqual(['Maria Rojas'])
  })

  it('busca en cualquier parte del nombre, no solo al inicio', () => {
    expect(nombres(filtrarTrabajadoresPorNombre(TRABAJADORES, 'mor'))).toEqual(['Pedro Mora'])
  })

  it('sin coincidencias devuelve lista vacia', () => {
    expect(filtrarTrabajadoresPorNombre(TRABAJADORES, 'zzz')).toEqual([])
  })

  it('devuelve una copia, no la lista original', () => {
    expect(filtrarTrabajadoresPorNombre(TRABAJADORES, '')).not.toBe(TRABAJADORES)
  })
})
