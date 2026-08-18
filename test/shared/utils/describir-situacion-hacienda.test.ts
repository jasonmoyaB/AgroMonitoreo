import { describe, expect, it } from 'vitest'
import { describirSituacionHacienda } from '../../../src/shared/utils/describir-situacion-hacienda'

describe('describirSituacionHacienda', () => {
  it('al dia muestra solo el estado', () => {
    expect(describirSituacionHacienda({ estado: 'Inscrito', moroso: false, omiso: false })).toBe('Inscrito')
  })

  it('marca al moroso', () => {
    expect(describirSituacionHacienda({ estado: 'Inscrito', moroso: true, omiso: false })).toBe('Inscrito (moroso)')
  })

  it('marca al omiso', () => {
    expect(describirSituacionHacienda({ estado: 'Inscrito', moroso: false, omiso: true })).toBe('Inscrito (omiso)')
  })

  it('junta las dos marcas con "y"', () => {
    expect(describirSituacionHacienda({ estado: 'Inscrito', moroso: true, omiso: true })).toBe('Inscrito (moroso y omiso)')
  })

  it('sin estado no deja un espacio colgando adelante', () => {
    expect(describirSituacionHacienda({ estado: '', moroso: true, omiso: false })).toBe('(moroso)')
  })

  it('sin estado y sin marcas devuelve vacio', () => {
    expect(describirSituacionHacienda({ estado: '', moroso: false, omiso: false })).toBe('')
  })
})
