import { describe, expect, it } from 'vitest'
import { contarAparicionesPwned } from '../../../../src/features/auth/utils/contar-apariciones-pwned'

const CUERPO = '1E4C9B93F3F0682250B6CF8331B7EE68FD8:10382543\r\n0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n'

describe('contarAparicionesPwned', () => {
  it('devuelve la cantidad cuando el sufijo esta en el rango', () => {
    expect(contarAparicionesPwned(CUERPO, '1E4C9B93F3F0682250B6CF8331B7EE68FD8')).toBe(10382543)
  })

  it('devuelve 0 cuando el sufijo no aparece', () => {
    expect(contarAparicionesPwned(CUERPO, 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toBe(0)
  })

  it('compara sin distinguir mayusculas', () => {
    expect(contarAparicionesPwned(CUERPO, '1e4c9b93f3f0682250b6cf8331b7ee68fd8')).toBe(10382543)
  })

  it('tolera lineas separadas solo con LF', () => {
    expect(contarAparicionesPwned(CUERPO.replace(/\r/g, ''), '0018A45C4D1DEF81644B54AB7F969B88D65')).toBe(1)
  })

  it('devuelve 0 con cuerpo vacio', () => {
    expect(contarAparicionesPwned('', '1E4C9B93F3F0682250B6CF8331B7EE68FD8')).toBe(0)
  })

  it('devuelve 0 con sufijo vacio, aunque el cuerpo tenga lineas', () => {
    expect(contarAparicionesPwned(CUERPO, '')).toBe(0)
  })

  it('devuelve 0 si la cantidad no es un numero', () => {
    expect(contarAparicionesPwned('ABC:no-es-numero', 'ABC')).toBe(0)
  })
})
