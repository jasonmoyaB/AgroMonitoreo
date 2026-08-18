import { crearBlobPdf, textoPdf as texto } from '../../../shared/lib/pdf-doc'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'
import { formatearFechaIsoDdMmAaaa } from '../../../shared/utils/fecha-iso'
import { formatearMonto } from '../../../shared/utils/formatear-monto'
import type { Moneda } from '../../../shared/types/domain.types'
import { PDF_COLORES, PDF_ESPACIO, PDF_LAYOUT, PDF_PAGINA, PDF_TIPO, lineaPdf, pintarEncabezadoPdf, pintarFondoPdf, pintarPiePdf, pintarTituloSeccionPdf, rectanguloPdf } from '../../../shared/utils/pdf/estilos-pdf'
import { altoTablaPdf, pintarEncabezadoTablaPdf, pintarFilaTablaPdf, topFilaPdf, type CeldaPdf } from '../../../shared/utils/pdf/tabla-pdf'

const DATOS = { alto: 100, padding: 16 }
const DATOS_BOTTOM = PDF_LAYOUT.contenidoTop - DATOS.alto
const SECCION_Y = DATOS_BOTTOM - PDF_ESPACIO.lg
const TABLA_TOP = SECCION_Y - PDF_ESPACIO.md
const COLUMNA_MONTO = PDF_PAGINA.derecha - 8
const NETO = { alto: 76, padding: 18 }
const FIRMAS = { lineaY: 300, etiquetaY: 284, ancho: 220 }

interface GenerarPdfLiquidacionInput {
  nombreCompleto: string
  fincaNombre: string
  inicio: string
  fin: string
  // monto es el neto pagado; montoBruto y diasAusentes explican de donde sale
  monto: number
  montoBruto: number
  diasAusentes: number
  moneda: Moneda
}

export function generarPdfLiquidacion(input: GenerarPdfLiquidacionInput): Blob {
  return crearBlobPdf(crearStream(input), PDF_PAGINA.ancho, PDF_PAGINA.alto)
}

function crearStream(input: GenerarPdfLiquidacionInput): string {
  const filas = input.diasAusentes > 0 ? 2 : 1
  return [
    pintarFondoPdf(),
    pintarEncabezadoPdf({ titulo: 'Liquidacion de quincena', subtitulo: input.fincaNombre, meta: 'COMPROBANTE DE PAGO' }),
    pintarDatos(input),
    pintarDetalle(input),
    pintarNeto(input, TABLA_TOP - altoTablaPdf(filas) - PDF_ESPACIO.lg),
    pintarFirmas(),
    pintarPiePdf(formatearFechaIsoDdMmAaaa(fechaLocalIso())),
  ].join('\n')
}

function pintarDatos({ nombreCompleto, inicio, fin }: GenerarPdfLiquidacionInput): string {
  const periodo = `${formatearFechaIsoDdMmAaaa(inicio)} al ${formatearFechaIsoDdMmAaaa(fin)}`
  return [
    rectanguloPdf({ x: PDF_PAGINA.margen, y: DATOS_BOTTOM, ancho: PDF_PAGINA.contenido, alto: DATOS.alto, relleno: PDF_COLORES.superficie, borde: PDF_COLORES.borde }),
    pintarCampo('Trabajador', nombreCompleto, DATOS_BOTTOM + 62),
    pintarCampo('Periodo', periodo, DATOS_BOTTOM + 16),
  ].join('\n')
}

function pintarCampo(titulo: string, valor: string, y: number): string {
  const x = PDF_PAGINA.margen + DATOS.padding
  return [
    texto({ valor: titulo.toUpperCase(), x, y: y + 18, size: PDF_TIPO.etiqueta, color: PDF_COLORES.verdeOscuro, peso: 'negrita' }),
    texto({ valor, x, y, size: PDF_TIPO.campo, color: PDF_COLORES.texto, peso: 'negrita' }),
  ].join('\n')
}

function pintarDetalle({ monto, montoBruto, diasAusentes, moneda }: GenerarPdfLiquidacionInput): string {
  const columnas: readonly CeldaPdf[] = [
    { valor: 'Concepto', x: PDF_PAGINA.margen + 8 },
    { valor: 'Monto', x: COLUMNA_MONTO, alinear: 'derecha' },
  ]
  const filas = [pintarFilaTablaPdf({ celdas: celdasBruto(montoBruto, moneda), y: topFilaPdf(TABLA_TOP, 0), index: 0 })]
  if (diasAusentes > 0) filas.push(pintarFilaTablaPdf({ celdas: celdasAusencias(montoBruto - monto, diasAusentes, moneda), y: topFilaPdf(TABLA_TOP, 1), index: 1 }))
  return [pintarTituloSeccionPdf({ titulo: 'Detalle del pago', y: SECCION_Y }), pintarEncabezadoTablaPdf({ columnas, y: TABLA_TOP }), ...filas].join('\n')
}

function celdasBruto(montoBruto: number, moneda: Moneda): readonly CeldaPdf[] {
  return [
    { valor: 'Bruto de la quincena', x: PDF_PAGINA.margen + 8 },
    { valor: formatearMonto(montoBruto, moneda), x: COLUMNA_MONTO, alinear: 'derecha', peso: 'negrita' },
  ]
}

function celdasAusencias(deduccion: number, diasAusentes: number, moneda: Moneda): readonly CeldaPdf[] {
  return [
    { valor: `Ausencias (${diasAusentes} ${diasAusentes === 1 ? 'dia' : 'dias'})`, x: PDF_PAGINA.margen + 8 },
    { valor: `-${formatearMonto(deduccion, moneda)}`, x: COLUMNA_MONTO, alinear: 'derecha', color: PDF_COLORES.rojo, peso: 'negrita' },
  ]
}

function pintarNeto({ monto, moneda }: GenerarPdfLiquidacionInput, y: number): string {
  const bottom = y - NETO.alto
  return [
    rectanguloPdf({ x: PDF_PAGINA.margen, y: bottom, ancho: PDF_PAGINA.contenido, alto: NETO.alto, relleno: PDF_COLORES.verdeOscuro }),
    texto({ valor: 'NETO PAGADO', x: PDF_PAGINA.margen + NETO.padding, y: bottom + 52, size: PDF_TIPO.marca, color: PDF_COLORES.blanco, peso: 'negrita' }),
    texto({ valor: formatearMonto(monto, moneda), x: PDF_PAGINA.derecha - NETO.padding, y: bottom + 18, size: PDF_TIPO.destacado, color: PDF_COLORES.blanco, peso: 'negrita', alinear: 'derecha' }),
  ].join('\n')
}

function pintarFirmas(): string {
  const izquierda = PDF_PAGINA.margen + 20
  const derecha = PDF_PAGINA.derecha - 20 - FIRMAS.ancho
  return [izquierda, derecha]
    .map((x, index) =>
      [
        lineaPdf({ x1: x, y1: FIRMAS.lineaY, x2: x + FIRMAS.ancho, y2: FIRMAS.lineaY, color: PDF_COLORES.borde }),
        texto({
          valor: index === 0 ? 'Firma del trabajador' : 'Firma de administracion',
          x: x + FIRMAS.ancho / 2,
          y: FIRMAS.etiquetaY,
          size: PDF_TIPO.tabla,
          color: PDF_COLORES.secundario,
          alinear: 'centro',
        }),
      ].join('\n'),
    )
    .join('\n')
}
