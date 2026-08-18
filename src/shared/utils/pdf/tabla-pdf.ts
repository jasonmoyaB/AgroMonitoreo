import { textoPdf as texto, type AlineacionPdf, type PesoPdf } from '../../lib/pdf-doc'
import { rectanguloPdf } from './estilos-pdf'
import { PDF_COLORES, PDF_LAYOUT, PDF_PAGINA, PDF_TIPO } from './tokens-pdf'

// Todas las tablas comparten el mismo contrato: `y` es el borde SUPERIOR de la
// banda de la fila; la linea base del texto se calcula aca para que ninguna
// tabla del proyecto invente su propio interlineado.
const BASE_TEXTO = 8
const PADDING = 8

export interface CeldaPdf {
  valor: string
  x: number
  alinear?: AlineacionPdf
  color?: string
  peso?: PesoPdf
}

interface TablaPdfInput {
  columnas: readonly CeldaPdf[]
  y: number
  x?: number
  ancho?: number
}

interface FilaPdfInput {
  celdas: readonly CeldaPdf[]
  y: number
  index: number
  x?: number
  ancho?: number
}

interface VacioPdfInput {
  mensaje: string
  y: number
  x?: number
  ancho?: number
}

export function topFilaPdf(topTabla: number, index: number): number {
  return topTabla - PDF_LAYOUT.filaAlto * (index + 1)
}

export function altoTablaPdf(totalFilas: number): number {
  return PDF_LAYOUT.filaAlto * (totalFilas + 1)
}

export function pintarEncabezadoTablaPdf({ columnas, y, x = PDF_PAGINA.margen, ancho = PDF_PAGINA.contenido }: TablaPdfInput): string {
  const fondo = rectanguloPdf({ x, y: y - PDF_LAYOUT.filaAlto, ancho, alto: PDF_LAYOUT.filaAlto, relleno: PDF_COLORES.verdeOscuro })
  const titulos = columnas.map((columna) => texto({ ...columna, y: lineaBase(y), size: PDF_TIPO.tabla, color: PDF_COLORES.blanco, peso: 'negrita' }))
  return [fondo, ...titulos].join('\n')
}

export function pintarFilaTablaPdf({ celdas, y, index, x = PDF_PAGINA.margen, ancho = PDF_PAGINA.contenido }: FilaPdfInput): string {
  const relleno = index % 2 === 0 ? PDF_COLORES.superficie : PDF_COLORES.fondo
  const fondo = rectanguloPdf({ x, y: y - PDF_LAYOUT.filaAlto, ancho, alto: PDF_LAYOUT.filaAlto, relleno, borde: PDF_COLORES.borde })
  const valores = celdas.map((celda) => texto({ ...celda, y: lineaBase(y), size: PDF_TIPO.cuerpo, color: celda.color ?? PDF_COLORES.texto }))
  return [fondo, ...valores].join('\n')
}

export function pintarVacioTablaPdf({ mensaje, y, x = PDF_PAGINA.margen, ancho = PDF_PAGINA.contenido }: VacioPdfInput): string {
  return [
    rectanguloPdf({ x, y: y - PDF_LAYOUT.filaAlto, ancho, alto: PDF_LAYOUT.filaAlto, relleno: PDF_COLORES.superficie, borde: PDF_COLORES.borde }),
    texto({ valor: mensaje, x: x + PADDING, y: lineaBase(y), size: PDF_TIPO.cuerpo, color: PDF_COLORES.secundario }),
  ].join('\n')
}

function lineaBase(y: number): number {
  return y - PDF_LAYOUT.filaAlto + BASE_TEXTO
}
