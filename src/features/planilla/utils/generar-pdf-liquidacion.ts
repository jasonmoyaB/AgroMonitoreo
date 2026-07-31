import { crearBlobPdf, textoPdf as texto } from '../../../shared/lib/pdf-doc'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'
import { formatearFechaIsoDdMmAaaa } from '../../../shared/utils/fecha-iso'
import { formatearMonto } from '../../../shared/utils/formatear-monto'
import type { Moneda } from '../../../shared/types/domain.types'

const PAGE = { width: 595, height: 842, margin: 48 }
const NEGRO = '0 0 0'
const GRIS = '0.35 0.35 0.35'
const ROJO = '0.65 0.15 0.10'
const RENGLON_ALTO = 26

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
  return crearBlobPdf(crearStream(input), PAGE.width, PAGE.height)
}

function crearStream(input: GenerarPdfLiquidacionInput): string {
  return [pintarEncabezado(input), pintarDatos(input), pintarMonto(input), pintarPie()].join('\n')
}

function pintarEncabezado({ fincaNombre }: GenerarPdfLiquidacionInput): string {
  return [texto('Liquidacion de quincena', PAGE.margin, 762, 22, NEGRO), texto(fincaNombre, PAGE.margin, 736, 13, GRIS)].join('\n')
}

function pintarDatos({ nombreCompleto, inicio, fin }: GenerarPdfLiquidacionInput): string {
  const periodo = `${formatearFechaIsoDdMmAaaa(inicio)} al ${formatearFechaIsoDdMmAaaa(fin)}`
  return [pintarCampo('Trabajador', nombreCompleto, 668), pintarCampo('Periodo', periodo, 612)].join('\n')
}

function pintarCampo(titulo: string, valor: string, y: number): string {
  return [texto(titulo, PAGE.margin, y + 22, 9, GRIS), texto(valor, PAGE.margin, y, 15, NEGRO)].join('\n')
}

function pintarMonto({ monto, montoBruto, diasAusentes, moneda }: GenerarPdfLiquidacionInput): string {
  return [
    pintarRenglon('Bruto quincena', formatearMonto(montoBruto, moneda), 556, NEGRO),
    pintarAusencias(montoBruto - monto, diasAusentes, moneda),
    '0.78 0.78 0.78 RG',
    `${PAGE.margin} 470 499 60 re S`,
    texto('Neto pagado', PAGE.margin + 16, 508, 9, GRIS),
    texto(formatearMonto(monto, moneda), PAGE.margin + 16, 482, 22, NEGRO),
  ].join('\n')
}

function pintarAusencias(deduccion: number, diasAusentes: number, moneda: Moneda): string {
  if (diasAusentes === 0) return ''
  const etiqueta = `Ausencias (${diasAusentes} ${diasAusentes === 1 ? 'dia' : 'dias'})`
  return pintarRenglon(etiqueta, `-${formatearMonto(deduccion, moneda)}`, 556 - RENGLON_ALTO, ROJO)
}

function pintarRenglon(titulo: string, valor: string, y: number, color: string): string {
  return [texto(titulo, PAGE.margin, y, 11, GRIS), texto(valor, PAGE.margin + 300, y, 13, color)].join('\n')
}

function pintarPie(): string {
  const hoy = formatearFechaIsoDdMmAaaa(fechaLocalIso())
  return texto(`Generado: ${hoy}`, PAGE.margin, 42, 9, GRIS)
}
