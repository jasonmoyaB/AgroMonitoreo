import { describe, expect, it } from 'vitest'
import type { Trabajador } from '../../../../src/shared/types/domain.types'
import type { TrabajadoresFiltros } from '../../../../src/features/trabajadores/types/trabajador-filtro.types'
import { filtrarTrabajadores } from '../../../../src/features/trabajadores/utils/filtrar-trabajadores'

function trabajador(id: string, nombreCompleto: string, activo: boolean): Trabajador {
  return { id, fincaId: 'birrisito', nombreCompleto, fotoUrl: null, activo, asegurado: false }
}

const ALVIN = trabajador('t1', 'Alvin Alcantara', true)
const MARIA = trabajador('t2', 'Maria Rojas', true)
const PEDRO = trabajador('t3', 'Pedro Mora', false)
const TRABAJADORES: readonly Trabajador[] = [ALVIN, MARIA, PEDRO]

const TODOS: TrabajadoresFiltros = { nombre: '', estado: 'todos' }

function nombres(trabajadores: readonly Trabajador[]): string[] {
  return trabajadores.map((trabajador) => trabajador.nombreCompleto)
}

describe('filtrarTrabajadores', () => {
  it('sin filtros devuelve a todos', () => {
    expect(filtrarTrabajadores(TRABAJADORES, TODOS)).toHaveLength(3)
  })

  it('busca por nombre sin distinguir mayusculas y recortando espacios', () => {
    expect(nombres(filtrarTrabajadores(TRABAJADORES, { ...TODOS, nombre: '  rOjAs  ' }))).toEqual(['Maria Rojas'])
  })

  it('busca por coincidencia parcial en cualquier parte del nombre', () => {
    expect(nombres(filtrarTrabajadores(TRABAJADORES, { ...TODOS, nombre: 'mor' }))).toEqual(['Pedro Mora'])
  })

  it('estado activo excluye a los inactivos', () => {
    expect(nombres(filtrarTrabajadores(TRABAJADORES, { ...TODOS, estado: 'activo' }))).toEqual(['Alvin Alcantara', 'Maria Rojas'])
  })

  it('estado inactivo devuelve solo a los inactivos', () => {
    expect(nombres(filtrarTrabajadores(TRABAJADORES, { ...TODOS, estado: 'inactivo' }))).toEqual(['Pedro Mora'])
  })

  it('estado ausente usa el set de ausentes, no el flag activo', () => {
    const ausentes = new Set(['t2'])

    expect(nombres(filtrarTrabajadores(TRABAJADORES, { ...TODOS, estado: 'ausente' }, ausentes))).toEqual(['Maria Rojas'])
  })

  it('estado ausente sin set de ausentes no devuelve a nadie', () => {
    expect(filtrarTrabajadores(TRABAJADORES, { ...TODOS, estado: 'ausente' })).toEqual([])
  })

  it('nombre y estado se combinan con AND', () => {
    const ausentes = new Set(['t1', 't2'])

    expect(nombres(filtrarTrabajadores(TRABAJADORES, { nombre: 'alvin', estado: 'ausente' }, ausentes))).toEqual(['Alvin Alcantara'])
  })

  it('no muta la lista original', () => {
    filtrarTrabajadores(TRABAJADORES, { ...TODOS, estado: 'activo' })

    expect(TRABAJADORES).toHaveLength(3)
  })
})
