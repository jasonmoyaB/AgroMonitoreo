import { describe, expect, it } from 'vitest'
import { validarEmailContacto } from '../../../../src/features/perfil/utils/validar-email-contacto'

describe('validarEmailContacto', () => {
  it('vacio es valido porque el campo es opcional', () => {
    expect(validarEmailContacto('')).toBeNull()
  })

  it('solo espacios cuenta como vacio', () => {
    expect(validarEmailContacto('   ')).toBeNull()
  })

  it('acepta un correo normal', () => {
    expect(validarEmailContacto('juan@gmail.com')).toBeNull()
  })

  it('acepta mayusculas y los simbolos que permite el regex', () => {
    expect(validarEmailContacto('Juan.Perez+finca_1@Sub.Dominio.CR')).toBeNull()
  })

  it('ignora espacios alrededor', () => {
    expect(validarEmailContacto('  juan@gmail.com  ')).toBeNull()
  })

  // este es el caso que motiva el util: el navegador lo da por bueno y la base no
  it('rechaza un dominio sin punto, que el input nativo si acepta', () => {
    expect(validarEmailContacto('juan@gmail')).not.toBeNull()
  })

  it('rechaza un TLD de una sola letra', () => {
    expect(validarEmailContacto('juan@gmail.c')).not.toBeNull()
  })

  it('rechaza texto sin arroba', () => {
    expect(validarEmailContacto('juan')).not.toBeNull()
  })

  it('rechaza un correo sin parte local', () => {
    expect(validarEmailContacto('@gmail.com')).not.toBeNull()
  })

  it('rechaza espacios en el medio', () => {
    expect(validarEmailContacto('juan perez@gmail.com')).not.toBeNull()
  })
})
