import { textoPdf as texto, crearBlobPdf } from '../../lib/pdf-doc'
import type { DashboardKpis, RankingItem, TendenciaPunto } from '../../types/kpis.types'

const PAGE = { width: 595, height: 842, margin: 40 }
const KPI = { top: 728, columnas: 4, boxWidth: 119, boxHeight: 46, colGap: 12, rowPitch: 60 }
const SECCION_GAP = 60
const RANKING_ITEM_GAP = 18
const RANKING_ITEMS_MOSTRADOS = 5
const TENDENCIA_ITEMS_MOSTRADOS = 12

interface GenerarPdfDashboardInput {
  titulo: string
  subtitulo: string
  kpis: DashboardKpis
  rankingLabores: readonly RankingItem[]
  rankingTrabajadores: readonly RankingItem[]
  tendenciaDiaria: readonly TendenciaPunto[]
}

interface TarjetaKpi {
  titulo: string
  valor: string
}

export function generarPdfDashboard(input: GenerarPdfDashboardInput): Blob {
  return crearBlobPdf(crearStream(input), PAGE.width, PAGE.height)
}

function crearStream(input: GenerarPdfDashboardInput): string {
  const tarjetas = construirTarjetasKpi(input.kpis)
  const resumenBottom = pintarResumenBottom(tarjetas.length)
  const rankingTop = resumenBottom - SECCION_GAP
  const rankingBottom = rankingTop - 24 - (RANKING_ITEMS_MOSTRADOS - 1) * RANKING_ITEM_GAP
  const tendenciaTop = rankingBottom - SECCION_GAP

  return [
    pintarEncabezado(input),
    pintarResumen(tarjetas),
    pintarRanking('Mejor labor del mes', input.rankingLabores, 48, rankingTop),
    pintarRanking('Mejor trabajador del mes', input.rankingTrabajadores, 307, rankingTop),
    pintarTendencia(input.tendenciaDiaria, tendenciaTop),
    pintarPie(),
  ].join('\n')
}

function construirTarjetasKpi(kpis: DashboardKpis): TarjetaKpi[] {
  return [
    { titulo: 'Horas del mes', valor: formatearNumero(kpis.totalHoras) },
    { titulo: 'Trabajadores activos', valor: String(kpis.trabajadoresActivos) },
    ...kpis.cantidadesPorUnidad.map((item) => ({ titulo: `${capitalizar(item.unidad)} producidos`, valor: formatearNumero(item.totalCantidad) })),
    ...kpis.cantidadesPorUnidad.map((item) => ({ titulo: `Productividad (${item.unidad}/hora)`, valor: item.productividadPromedio.toFixed(1) })),
  ]
}

function pintarEncabezado({ titulo, subtitulo }: GenerarPdfDashboardInput): string {
  return [texto(titulo, 48, 778, 22, '0 0 0'), texto(subtitulo, 48, 750, 13, '0.20 0.20 0.20')].join('\n')
}

function pintarResumen(tarjetas: readonly TarjetaKpi[]): string {
  return tarjetas.map((tarjeta, index) => cajaResumen(posicionColumna(index), posicionFila(index), tarjeta)).join('\n')
}

function pintarResumenBottom(totalTarjetas: number): number {
  const filas = Math.ceil(totalTarjetas / KPI.columnas)
  return KPI.top - (filas - 1) * KPI.rowPitch - KPI.boxHeight
}

function posicionColumna(index: number): number {
  return PAGE.margin + (index % KPI.columnas) * (KPI.boxWidth + KPI.colGap)
}

function posicionFila(index: number): number {
  const fila = Math.floor(index / KPI.columnas)
  return KPI.top - fila * KPI.rowPitch - KPI.boxHeight
}

function cajaResumen(x: number, y: number, tarjeta: TarjetaKpi): string {
  return ['0.78 0.78 0.78 RG', `${x} ${y} ${KPI.boxWidth} ${KPI.boxHeight} re S`, texto(tarjeta.titulo, x + 8, y + 28, 8, '0.25 0.25 0.25'), texto(tarjeta.valor, x + 8, y + 8, 16, '0 0 0')].join('\n')
}

function pintarRanking(titulo: string, items: readonly RankingItem[], x: number, y: number): string {
  const filas = items.slice(0, RANKING_ITEMS_MOSTRADOS).map((item, index) => texto(`${index + 1}. ${acortar(item.etiqueta)} - ${formatearNumero(item.valor)}`, x, y - 24 - index * RANKING_ITEM_GAP, 10, '0.15 0.15 0.15'))
  return [texto(titulo, x, y, 13, '0 0 0'), ...filas].join('\n')
}

function pintarTendencia(puntos: readonly TendenciaPunto[], y: number): string {
  const filas = puntos.slice(0, TENDENCIA_ITEMS_MOSTRADOS).map((punto, index) => texto(`${punto.fecha}: ${formatearNumero(punto.valor)}`, 48 + (index % 2) * 260, y - 24 - Math.floor(index / 2) * RANKING_ITEM_GAP, 10, '0.15 0.15 0.15'))
  return [texto('Producción diaria del mes', 48, y, 13, '0 0 0'), ...filas].join('\n')
}

function pintarPie(): string {
  return texto(`Generado: ${new Date().toLocaleDateString('es-CL')}`, PAGE.margin, 42, 9, '0.35 0.35 0.35')
}

function acortar(textoCompleto: string): string {
  return textoCompleto.length > 22 ? `${textoCompleto.slice(0, 20)}...` : textoCompleto
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function formatearNumero(valor: number): string {
  return valor.toLocaleString('es-CL', { maximumFractionDigits: 1 })
}
