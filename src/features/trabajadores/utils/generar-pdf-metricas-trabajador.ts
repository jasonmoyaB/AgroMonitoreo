import { textoPdf as texto, crearBlobPdf } from '../../../shared/lib/pdf-doc'
import { formatearFechaIsoDdMmAaaa } from '../../captura/utils/fecha-iso'
import { agruparCantidadPorUnidad } from './agrupar-cantidad-por-unidad'
import type { MetricaPorLabor, TrabajadorMetricasTotales } from '../types/trabajador-metricas.types'

const PAGE = { width: 595, height: 842, margin: 40 }
const TABLA = { x: 40, y: 600, rowHeight: 28 }
const COLUMNAS = { labor: 0, horasNormales: 130, horasExtra: 200, cantidad: 270, cantidadExtra: 350, productividad: 460 }
const RESUMEN = { x: 40, anchoDisponible: 515, gap: 8 }

interface GenerarPdfMetricasTrabajadorInput {
  trabajadorNombre: string
  fincaNombre: string
  metricasPorLabor: readonly MetricaPorLabor[]
  totales: TrabajadorMetricasTotales
}

export function generarPdfMetricasTrabajador(input: GenerarPdfMetricasTrabajadorInput): Blob {
  const stream = [pintarEncabezado(input), pintarResumen(input), pintarTabla(input.metricasPorLabor), pintarPie()].join('\n')
  return crearBlobPdf(stream, PAGE.width, PAGE.height)
}

function pintarEncabezado({ trabajadorNombre, fincaNombre }: GenerarPdfMetricasTrabajadorInput): string {
  return [
    texto('Metricas del trabajador', PAGE.margin, 780, 22, '0 0 0'),
    texto(trabajadorNombre, PAGE.margin, 752, 16, '0 0 0'),
    texto(fincaNombre, PAGE.margin, 732, 12, '0.30 0.30 0.30'),
  ].join('\n')
}

function pintarResumen({ totales, metricasPorLabor }: GenerarPdfMetricasTrabajadorInput): string {
  const cantidadesPorUnidad = agruparCantidadPorUnidad(metricasPorLabor)
  const items = [
    { titulo: 'Horas totales', valor: totales.horas.toLocaleString('es-CL') },
    ...cantidadesPorUnidad.map((item) => ({ titulo: `Cant. ${item.unidadMedida}`, valor: item.cantidad.toLocaleString('es-CL') })),
    { titulo: 'Productividad', valor: totales.productividad.toFixed(1) },
    { titulo: 'Horas extra', valor: totales.horasExtra.toLocaleString('es-CL') },
  ]
  const ancho = (RESUMEN.anchoDisponible - (items.length - 1) * RESUMEN.gap) / items.length

  return items.map((item, index) => cajaResumen(RESUMEN.x + index * (ancho + RESUMEN.gap), ancho, item.titulo, item.valor)).join('\n')
}

function cajaResumen(x: number, ancho: number, titulo: string, valor: string): string {
  return ['0.78 0.78 0.78 RG', `${x} 655 ${ancho} 46 re S`, texto(titulo, x + 10, 683, 9, '0.25 0.25 0.25'), texto(valor, x + 10, 663, 16, '0 0 0')].join('\n')
}

function pintarTabla(metricas: readonly MetricaPorLabor[]): string {
  if (metricas.length === 0) return texto('Sin registros en el periodo seleccionado.', TABLA.x, TABLA.y, 12, '0.4 0.4 0.4')
  return [pintarEncabezadoTabla(), ...metricas.map(pintarFila)].join('\n')
}

function pintarEncabezadoTabla(): string {
  const y = TABLA.y
  return [
    texto('Labor', TABLA.x + COLUMNAS.labor, y, 10, '0.25 0.25 0.25'),
    texto('H. normales', TABLA.x + COLUMNAS.horasNormales, y, 10, '0.25 0.25 0.25'),
    texto('H. extra', TABLA.x + COLUMNAS.horasExtra, y, 10, '0.25 0.25 0.25'),
    texto('Cant. h. normales', TABLA.x + COLUMNAS.cantidad, y, 10, '0.25 0.25 0.25'),
    texto('Cant. h. extras', TABLA.x + COLUMNAS.cantidadExtra, y, 10, '0.25 0.25 0.25'),
    texto('Product.', TABLA.x + COLUMNAS.productividad, y, 10, '0.25 0.25 0.25'),
  ].join('\n')
}

function pintarFila(metrica: MetricaPorLabor, index: number): string {
  const y = TABLA.y - (index + 1) * TABLA.rowHeight
  const horasNormales = metrica.horas - metrica.horasExtra
  const cantidadNormal = metrica.cantidad - metrica.cantidadExtra
  const horasExtra = metrica.horasExtra > 0 ? metrica.horasExtra.toLocaleString('es-CL') : '-'
  const cantidadExtra = metrica.cantidadExtra > 0 ? metrica.cantidadExtra.toLocaleString('es-CL') : '-'
  const colorExtra = metrica.horasExtra > 0 ? '0.6 0.35 0' : '0.5 0.5 0.5'
  return [
    texto(metrica.nombre, TABLA.x + COLUMNAS.labor, y, 11, '0 0 0'),
    texto(horasNormales.toLocaleString('es-CL'), TABLA.x + COLUMNAS.horasNormales, y, 11, '0.15 0.15 0.15'),
    texto(horasExtra, TABLA.x + COLUMNAS.horasExtra, y, 11, colorExtra),
    texto(`${cantidadNormal.toLocaleString('es-CL')} ${metrica.unidadMedida ?? ''}`.trim(), TABLA.x + COLUMNAS.cantidad, y, 11, '0.15 0.15 0.15'),
    texto(cantidadExtra, TABLA.x + COLUMNAS.cantidadExtra, y, 11, colorExtra),
    texto(metrica.productividad.toFixed(1), TABLA.x + COLUMNAS.productividad, y, 11, '0 0.35 0.15'),
  ].join('\n')
}

function pintarPie(): string {
  return texto(`Generado: ${formatearFechaIsoDdMmAaaa(new Date().toISOString().slice(0, 10))}`, PAGE.margin, 42, 9, '0.35 0.35 0.35')
}
