import { crearBlobPdf, textoPdf as texto } from '../../../shared/lib/pdf-doc'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'
import { formatearFechaIsoDdMmAaaa } from '../../../shared/utils/fecha-iso'
import { formatearMonto } from '../../../shared/utils/formatear-monto'
import type { Moneda } from '../../../shared/types/domain.types'

const PAGE = { width: 595, height: 842, margin: 48 }
const NEGRO = '0 0 0'
const GRIS = '0.35 0.35 0.35'

interface GenerarPdfLiquidacionInput {
  nombreCompleto: string
  fincaNombre: string
  inicio: string
  fin: string
  monto: number
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

function pintarMonto({ monto, moneda }: GenerarPdfLiquidacionInput): string {
  return [
    '0.78 0.78 0.78 RG',
    `${PAGE.margin} 500 499 76 re S`,
    texto('Monto pagado', PAGE.margin + 16, 552, 9, GRIS),
    texto(formatearMonto(monto, moneda), PAGE.margin + 16, 520, 24, NEGRO),
  ].join('\n')
}

function pintarPie(): string {
  const hoy = formatearFechaIsoDdMmAaaa(fechaLocalIso())
  return texto(`Generado: ${hoy}`, PAGE.margin, 42, 9, GRIS)
}
