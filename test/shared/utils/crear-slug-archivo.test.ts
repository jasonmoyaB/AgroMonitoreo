import { describe, expect, it } from 'vitest'
import { crearSlugArchivo } from '../../../src/shared/utils/crear-slug-archivo'

describe('crearSlugArchivo', () => {
  it('baja a minusculas y saca los diacriticos', () => {
    expect(crearSlugArchivo('José Martínez Ñuñez')).toBe('jose-martinez-nunez')
  })

  it('colapsa cualquier corrida de caracteres no alfanumericos en un solo guion', () => {
    expect(crearSlugArchivo('dashboard   por / finca')).toBe('dashboard-por-finca')
  })

  it('no deja guiones al principio ni al final', () => {
    expect(crearSlugArchivo('  ¡Finca Birrisito!  ')).toBe('finca-birrisito')
  })

  it('devuelve cadena vacia cuando no queda nada alfanumerico', () => {
    expect(crearSlugArchivo('¿?¡!')).toBe('')
  })
})
