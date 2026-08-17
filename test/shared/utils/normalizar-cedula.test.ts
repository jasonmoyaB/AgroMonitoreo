import { describe, expect, it } from 'vitest'
import { esCedulaConsultable, normalizarCedula } from '../../../src/shared/utils/normalizar-cedula'

describe('normalizarCedula', () => {
  it('quita los guiones con los que se escribe la cedula fisica', () => {
    expect(normalizarCedula('1-0234-0567')).toBe('102340567')
  })

  it('quita espacios', () => {
    expect(normalizarCedula(' 3 101 999999 ')).toBe('3101999999')
  })

  it('deja intacta una cedula que ya viene limpia', () => {
    expect(normalizarCedula('102340567')).toBe('102340567')
  })

  it('devuelve vacio cuando no hay ningun digito', () => {
    expect(normalizarCedula('sin numeros')).toBe('')
  })

  it('vacio se mantiene vacio', () => {
    expect(normalizarCedula('')).toBe('')
  })
})

describe('esCedulaConsultable', () => {
  it('acepta los 9 digitos de una cedula fisica', () => {
    expect(esCedulaConsultable('102340567')).toBe(true)
  })

  it('acepta los 10 de una juridica', () => {
    expect(esCedulaConsultable('3101999999')).toBe(true)
  })

  it('acepta los 12 de un DIMEX', () => {
    expect(esCedulaConsultable('123456789012')).toBe(true)
  })

  it('rechaza una cedula a medio escribir', () => {
    expect(esCedulaConsultable('1023')).toBe(false)
  })

  it('rechaza vacio, que es el estado inicial del campo', () => {
    expect(esCedulaConsultable('')).toBe(false)
  })

  it('rechaza mas digitos que un DIMEX', () => {
    expect(esCedulaConsultable('1234567890123')).toBe(false)
  })
})
