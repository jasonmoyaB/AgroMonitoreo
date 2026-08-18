import { describe, expect, it } from 'vitest'
import { acortarTextoPdf, medirTextoPdf, normalizarTextoPdf } from '../../../src/shared/lib/pdf-texto'

describe('normalizarTextoPdf', () => {
  it('deja solo ASCII imprimible, que es lo único que dibuja Helvetica', () => {
    expect(normalizarTextoPdf('Deshíja — “niño” ₡1 000')).toBe('Deshija - "nino" CRC 1 000')
  })
})

describe('medirTextoPdf', () => {
  it('mide con la tabla oficial de Helvetica y escala con el tamaño', () => {
    // 'll' = 222 + 222 milésimas de em
    expect(medirTextoPdf('ll', 10)).toBeCloseTo(4.44, 5)
    expect(medirTextoPdf('ll', 20)).toBeCloseTo(8.88, 5)
  })

  it('la negrita ocupa más que la normal', () => {
    expect(medirTextoPdf('Trabajadores', 10, 'negrita')).toBeGreaterThan(medirTextoPdf('Trabajadores', 10, 'normal'))
  })

  it('los dígitos miden todos igual, así una columna numérica queda pareja', () => {
    expect(medirTextoPdf('111', 10)).toBeCloseTo(medirTextoPdf('999', 10), 5)
  })

  it('mide el texto ya normalizado, no el original', () => {
    expect(medirTextoPdf('Deshija', 10)).toBeCloseTo(medirTextoPdf('Deshíja', 10), 5)
  })
})

describe('acortarTextoPdf', () => {
  it('devuelve el texto intacto cuando entra en el ancho', () => {
    expect(acortarTextoPdf({ valor: 'Palea', anchoMaximo: 100, size: 10 })).toBe('Palea')
  })

  it('corta con puntos suspensivos y el resultado sí entra en el ancho', () => {
    const acortado = acortarTextoPdf({ valor: 'Wilberth Alberto Mora Rodriguez', anchoMaximo: 52, size: 7 })

    expect(acortado.endsWith('...')).toBe(true)
    expect(medirTextoPdf(acortado, 7)).toBeLessThanOrEqual(52)
  })

  it('corta por ancho real: un nombre ancho pierde más letras que uno angosto', () => {
    const ancho = acortarTextoPdf({ valor: 'MMMMMMMMMM', anchoMaximo: 40, size: 8 })
    const angosto = acortarTextoPdf({ valor: 'llllllllll', anchoMaximo: 40, size: 8 })

    expect(angosto.length).toBeGreaterThan(ancho.length)
  })
})
