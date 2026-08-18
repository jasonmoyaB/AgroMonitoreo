import { textoPdf as texto, crearBlobPdf } from '../../../shared/lib/pdf-doc'
import { acortarTextoPdf } from '../../../shared/lib/pdf-texto'
import { formatearFechaIsoDdMmAaaa } from '../../../shared/utils/fecha-iso'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'
import { agruparCantidadPorUnidad } from './agrupar-cantidad-por-unidad'
import type { MetricaPorLabor, TrabajadorMetricasTotales } from '../types/trabajador-metricas.types'
import { PDF_COLORES, PDF_ESPACIO, PDF_LAYOUT, PDF_PAGINA, PDF_TIPO, pintarEncabezadoPdf, pintarFondoPdf, pintarPiePdf, pintarTarjetaResumenPdf, pintarTituloSeccionPdf } from '../../../shared/utils/pdf/estilos-pdf'
import { pintarEncabezadoTablaPdf, pintarFilaTablaPdf, pintarVacioTablaPdf, topFilaPdf, type CeldaPdf } from '../../../shared/utils/pdf/tabla-pdf'

const CONTEXTO_Y = PDF_LAYOUT.contenidoTop - 8
const RESUMEN_BOTTOM = CONTEXTO_Y - PDF_ESPACIO.md - PDF_LAYOUT.tarjetaAlto
const SECCION_Y = RESUMEN_BOTTOM - PDF_ESPACIO.lg
const TABLA_TOP = SECCION_Y - PDF_ESPACIO.md
// tope para que la labor mas larga no toque el encabezado "H. normales", que arranca en ~216
const ANCHO_LABOR = 160
// x de cada columna: izquierda para texto, derecha para todo lo numerico
const COLUMNAS = { labor: PDF_PAGINA.margen + 8, horasNormales: 268, horasExtra: 328, cantidad: 428, cantidadExtra: 492, productividad: PDF_PAGINA.derecha - 8 } as const

interface GenerarPdfMetricasTrabajadorInput {
  trabajadorNombre: string
  fincaNombre: string
  periodo: string
  metricasPorLabor: readonly MetricaPorLabor[]
  totales: TrabajadorMetricasTotales
}

export function generarPdfMetricasTrabajador(input: GenerarPdfMetricasTrabajadorInput): Blob {
  const stream = [
    pintarFondoPdf(),
    pintarEncabezadoPdf({ titulo: 'Metricas del trabajador', subtitulo: `${input.trabajadorNombre} | ${input.fincaNombre}`, meta: 'REPORTE INDIVIDUAL' }),
    pintarPeriodo(input.periodo),
    pintarResumen(input),
    pintarTabla(input.metricasPorLabor),
    pintarPiePdf(formatearFechaIsoDdMmAaaa(fechaLocalIso())),
  ].join('\n')
  return crearBlobPdf(stream, PDF_PAGINA.ancho, PDF_PAGINA.alto)
}

function pintarPeriodo(periodo: string): string {
  return [
    texto({ valor: 'PERIODO', x: PDF_PAGINA.margen, y: CONTEXTO_Y, size: PDF_TIPO.etiqueta, color: PDF_COLORES.verdeOscuro, peso: 'negrita' }),
    texto({ valor: periodo, x: PDF_PAGINA.margen + 56, y: CONTEXTO_Y, size: PDF_TIPO.cuerpo, color: PDF_COLORES.texto }),
  ].join('\n')
}

function pintarResumen({ totales, metricasPorLabor }: GenerarPdfMetricasTrabajadorInput): string {
  const items = [
    { titulo: 'Horas totales', valor: formatearNumero(totales.horas) },
    ...agruparCantidadPorUnidad(metricasPorLabor).map((item) => ({ titulo: `Cant. ${item.unidadMedida}`, valor: formatearNumero(item.cantidad) })),
    { titulo: 'Productividad', valor: totales.productividad.toFixed(1) },
    { titulo: 'Horas extra', valor: formatearNumero(totales.horasExtra) },
  ]
  const ancho = (PDF_PAGINA.contenido - (items.length - 1) * PDF_ESPACIO.sm) / items.length
  return items
    .map((item, index) =>
      pintarTarjetaResumenPdf({ x: PDF_PAGINA.margen + index * (ancho + PDF_ESPACIO.sm), y: RESUMEN_BOTTOM, ancho, alto: PDF_LAYOUT.tarjetaAlto, titulo: item.titulo, valor: item.valor }),
    )
    .join('\n')
}

function pintarTabla(metricas: readonly MetricaPorLabor[]): string {
  const seccion = pintarTituloSeccionPdf({ titulo: 'Detalle por labor', y: SECCION_Y })
  if (metricas.length === 0) return [seccion, pintarVacioTablaPdf({ mensaje: 'Sin registros en el periodo seleccionado.', y: TABLA_TOP })].join('\n')
  const filas = metricas.map((metrica, index) => pintarFilaTablaPdf({ celdas: celdasFila(metrica), y: topFilaPdf(TABLA_TOP, index), index }))
  return [seccion, pintarEncabezadoTablaPdf({ columnas: columnasTabla(), y: TABLA_TOP }), ...filas].join('\n')
}

function columnasTabla(): readonly CeldaPdf[] {
  return [
    { valor: 'Labor', x: COLUMNAS.labor },
    { valor: 'H. normales', x: COLUMNAS.horasNormales, alinear: 'derecha' },
    { valor: 'H. extra', x: COLUMNAS.horasExtra, alinear: 'derecha' },
    { valor: 'Cant. normal', x: COLUMNAS.cantidad, alinear: 'derecha' },
    { valor: 'Cant. extra', x: COLUMNAS.cantidadExtra, alinear: 'derecha' },
    { valor: 'Product.', x: COLUMNAS.productividad, alinear: 'derecha' },
  ]
}

function celdasFila(metrica: MetricaPorLabor): readonly CeldaPdf[] {
  const colorExtra = metrica.horasExtra > 0 ? PDF_COLORES.rojo : PDF_COLORES.secundario
  const unidad = metrica.unidadMedida ? ` ${metrica.unidadMedida}` : ''
  return [
    { valor: acortarTextoPdf({ valor: metrica.nombre, anchoMaximo: ANCHO_LABOR, size: PDF_TIPO.cuerpo }), x: COLUMNAS.labor },
    { valor: formatearNumero(metrica.horas - metrica.horasExtra), x: COLUMNAS.horasNormales, alinear: 'derecha' },
    { valor: metrica.horasExtra > 0 ? formatearNumero(metrica.horasExtra) : '-', x: COLUMNAS.horasExtra, alinear: 'derecha', color: colorExtra },
    { valor: `${formatearNumero(metrica.cantidad - metrica.cantidadExtra)}${unidad}`, x: COLUMNAS.cantidad, alinear: 'derecha' },
    { valor: metrica.cantidadExtra > 0 ? formatearNumero(metrica.cantidadExtra) : '-', x: COLUMNAS.cantidadExtra, alinear: 'derecha', color: colorExtra },
    { valor: metrica.productividad.toFixed(1), x: COLUMNAS.productividad, alinear: 'derecha', color: PDF_COLORES.verdeOscuro, peso: 'negrita' },
  ]
}

function formatearNumero(valor: number): string {
  return valor.toLocaleString('es-CL')
}
