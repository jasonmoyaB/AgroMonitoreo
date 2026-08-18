import { textoPdf as texto } from '../../lib/pdf-doc'
import { acortarTextoPdf } from '../../lib/pdf-texto'
import { PDF_COLORES, PDF_ESPACIO, PDF_LAYOUT, PDF_PAGINA, PDF_TIPO } from './tokens-pdf'

export { PDF_COLORES, PDF_ESPACIO, PDF_LAYOUT, PDF_PAGINA, PDF_TIPO }

const MARCA = 'AgroMonitoreo'
const BARRA_TARJETA = 4
const PADDING_TARJETA = 14

interface EncabezadoPdfInput {
  titulo: string
  subtitulo: string
  // etiqueta del tipo de documento, arriba a la derecha
  meta?: string
}

interface RectanguloPdfInput {
  x: number
  y: number
  ancho: number
  alto: number
  relleno?: string
  borde?: string
}

interface TarjetaResumenPdfInput extends RectanguloPdfInput {
  titulo: string
  valor: string
}

interface LineaPdfInput {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
}

interface TituloSeccionPdfInput {
  titulo: string
  y: number
  x?: number
  ancho?: number
}

export function pintarFondoPdf(): string {
  return rectanguloPdf({ x: 0, y: 0, ancho: PDF_PAGINA.ancho, alto: PDF_PAGINA.alto, relleno: PDF_COLORES.fondo })
}

export function pintarEncabezadoPdf({ titulo, subtitulo, meta }: EncabezadoPdfInput): string {
  return [
    rectanguloPdf({ x: 0, y: PDF_LAYOUT.bandaY, ancho: PDF_PAGINA.ancho, alto: PDF_LAYOUT.bandaAlto, relleno: PDF_COLORES.verdeOscuro }),
    texto({ valor: MARCA.toUpperCase(), x: PDF_PAGINA.margen, y: PDF_LAYOUT.marcaY, size: PDF_TIPO.marca, color: PDF_COLORES.blanco, peso: 'negrita' }),
    meta ? texto({ valor: meta, x: PDF_PAGINA.derecha, y: PDF_LAYOUT.marcaY, size: PDF_TIPO.marca, color: PDF_COLORES.blanco, alinear: 'derecha' }) : '',
    texto({ valor: titulo, x: PDF_PAGINA.margen, y: PDF_LAYOUT.tituloY, size: PDF_TIPO.titulo, color: PDF_COLORES.texto, peso: 'negrita' }),
    texto({ valor: subtitulo, x: PDF_PAGINA.margen, y: PDF_LAYOUT.subtituloY, size: PDF_TIPO.subtitulo, color: PDF_COLORES.secundario }),
    lineaPdf({ x1: PDF_PAGINA.margen, y1: PDF_LAYOUT.reglaY, x2: PDF_PAGINA.derecha, y2: PDF_LAYOUT.reglaY, color: PDF_COLORES.borde }),
  ].join('\n')
}

export function pintarTarjetaResumenPdf(input: TarjetaResumenPdfInput): string {
  return [
    rectanguloPdf({ ...input, relleno: PDF_COLORES.superficie, borde: PDF_COLORES.borde }),
    rectanguloPdf({ x: input.x, y: input.y, ancho: BARRA_TARJETA, alto: input.alto, relleno: PDF_COLORES.verde }),
    texto({
      valor: acortarTextoPdf({ valor: input.titulo, anchoMaximo: input.ancho - PADDING_TARJETA * 2, size: PDF_TIPO.etiqueta }),
      x: input.x + PADDING_TARJETA,
      y: input.y + input.alto - 18,
      size: PDF_TIPO.etiqueta,
      color: PDF_COLORES.secundario,
    }),
    texto({ valor: input.valor, x: input.x + PADDING_TARJETA, y: input.y + 12, size: PDF_TIPO.dato, color: PDF_COLORES.texto, peso: 'negrita' }),
  ].join('\n')
}

export function pintarTituloSeccionPdf({ titulo, y, x = PDF_PAGINA.margen, ancho = PDF_PAGINA.contenido }: TituloSeccionPdfInput): string {
  return [
    texto({ valor: titulo, x, y, size: PDF_TIPO.seccion, color: PDF_COLORES.verdeOscuro, peso: 'negrita' }),
    lineaPdf({ x1: x, y1: y - PDF_ESPACIO.xs - 3, x2: x + ancho, y2: y - PDF_ESPACIO.xs - 3, color: PDF_COLORES.borde }),
  ].join('\n')
}

export function pintarPiePdf(fecha: string): string {
  return [
    lineaPdf({ x1: PDF_PAGINA.margen, y1: PDF_LAYOUT.pieReglaY, x2: PDF_PAGINA.derecha, y2: PDF_LAYOUT.pieReglaY, color: PDF_COLORES.borde }),
    texto({ valor: `Generado: ${fecha}`, x: PDF_PAGINA.margen, y: PDF_LAYOUT.pieY, size: PDF_TIPO.pie, color: PDF_COLORES.secundario }),
    texto({ valor: MARCA, x: PDF_PAGINA.derecha, y: PDF_LAYOUT.pieY, size: PDF_TIPO.pie, color: PDF_COLORES.verdeOscuro, peso: 'negrita', alinear: 'derecha' }),
  ].join('\n')
}

export function rectanguloPdf({ x, y, ancho, alto, relleno, borde }: RectanguloPdfInput): string {
  const partes: string[] = []
  if (relleno) partes.push(`${relleno} rg`, `${x} ${y} ${ancho} ${alto} re f`)
  if (borde) partes.push(`${borde} RG`, `${x} ${y} ${ancho} ${alto} re S`)
  return partes.join('\n')
}

export function lineaPdf({ x1, y1, x2, y2, color }: LineaPdfInput): string {
  return `${color} RG\n${x1} ${y1} m\n${x2} ${y2} l\nS`
}
