import { describe, expect, it } from 'vitest'
import { textoPdf } from '../../../src/shared/lib/pdf-doc'
import { medirTextoPdf } from '../../../src/shared/lib/pdf-texto'

const ESPACIO_ANGOSTO = '\u202f'

describe('textoPdf', () => {
  it('convierte el símbolo de colones y espacios Unicode a texto compatible con PDF', () => {
    const contenido = textoPdf({ valor: `Neto pagado ₡151${ESPACIO_ANGOSTO}150`, x: 40, y: 100, size: 12, color: '0 0 0' })

    expect(contenido).toContain('(Neto pagado CRC 151 150)')
    expect(contenido).not.toContain('₡')
    expect(contenido).not.toContain(ESPACIO_ANGOSTO)
  })

  it('usa la fuente normal por defecto y la negrita cuando se pide', () => {
    expect(textoPdf({ valor: 'Total', x: 0, y: 0, size: 10, color: '0 0 0' })).toContain('/F1 10 Tf')
    expect(textoPdf({ valor: 'Total', x: 0, y: 0, size: 10, color: '0 0 0', peso: 'negrita' })).toContain('/F2 10 Tf')
  })

  it('alinea a la derecha restando el ancho real del texto', () => {
    const ancho = medirTextoPdf('CRC 151 150', 10, 'normal')
    const contenido = textoPdf({ valor: 'CRC 151 150', x: 555, y: 100, size: 10, color: '0 0 0', alinear: 'derecha' })

    expect(contenido).toContain(`${Math.round((555 - ancho) * 100) / 100} 100 Td`)
  })

  it('centra dejando la misma mitad del ancho a cada lado', () => {
    const ancho = medirTextoPdf('L', 9, 'negrita')
    const contenido = textoPdf({ valor: 'L', x: 100, y: 50, size: 9, color: '0 0 0', peso: 'negrita', alinear: 'centro' })

    expect(contenido).toContain(`${Math.round((100 - ancho / 2) * 100) / 100} 50 Td`)
  })

  it('escapa paréntesis y barras para no romper el stream', () => {
    expect(textoPdf({ valor: 'Productividad (cajas/hora)', x: 0, y: 0, size: 9, color: '0 0 0' })).toContain('\\(cajas/hora\\)')
  })
})
