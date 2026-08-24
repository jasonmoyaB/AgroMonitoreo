import { acortarTextoPdf } from '../../lib/pdf-texto'
import type { DashboardUnidad, RankingItem, TendenciaPunto } from '../../types/kpis.types'
import { PDF_COLORES, PDF_ESPACIO, PDF_PAGINA, PDF_TIPO, pintarTituloSeccionPdf } from './estilos-pdf'
import { altoTablaPdf, pintarEncabezadoTablaPdf, pintarFilaTablaPdf, pintarVacioTablaPdf, topFilaPdf, type CeldaPdf } from './tabla-pdf'

const COLUMNA = { ancho: 248, izquierda: PDF_PAGINA.margen, derecha: 307 }
const RANKING = { visibles: 5, anchoEtiqueta: 148 }
const TENDENCIA = { visibles: 12, porFila: 2, separacion: 267 }

interface RankingPdfInput {
  titulo: string
  etiqueta: string
  items: readonly RankingItem[]
  unidad: string
  x: number
  y: number
}

// Un bloque por unidad: cajas y tramos no se suman, asi que cada seccion dice de que
// unidad esta hablando en el titulo y en el encabezado de la columna de totales.
export function pintarSeccionesUnidadPdf(bloque: DashboardUnidad, top: number): string {
  const rankingTitulo = top - PDF_ESPACIO.lg
  const rankingTabla = rankingTitulo - PDF_ESPACIO.md
  const filas = Math.min(Math.max(bloque.rankingLabores.length, bloque.rankingTrabajadores.length, 1), RANKING.visibles)
  const geometria = { unidad: bloque.unidad, y: rankingTitulo }

  return [
    pintarRanking({ titulo: `Mejor labor (${bloque.unidad})`, etiqueta: 'Labor', items: bloque.rankingLabores, x: COLUMNA.izquierda, ...geometria }),
    pintarRanking({ titulo: `Mejor trabajador (${bloque.unidad})`, etiqueta: 'Trabajador', items: bloque.rankingTrabajadores, x: COLUMNA.derecha, ...geometria }),
    pintarTendencia(bloque, rankingTabla - altoTablaPdf(filas) - PDF_ESPACIO.lg),
  ].join('\n')
}

function pintarRanking({ titulo, etiqueta, items, unidad, x, y }: RankingPdfInput): string {
  const geometria = { x, ancho: COLUMNA.ancho }
  const top = y - PDF_ESPACIO.md
  const seccion = pintarTituloSeccionPdf({ titulo, x, y, ancho: COLUMNA.ancho })
  if (items.length === 0) return [seccion, pintarVacioTablaPdf({ mensaje: 'Sin datos del mes.', y: top, ...geometria })].join('\n')
  const filas = items.slice(0, RANKING.visibles).map((item, index) => pintarFilaTablaPdf({ celdas: celdasRanking(item, index, x), y: topFilaPdf(top, index), index, ...geometria }))
  return [seccion, pintarEncabezadoTablaPdf({ columnas: columnasRanking(etiqueta, unidad, x), y: top, ...geometria }), ...filas].join('\n')
}

function columnasRanking(etiqueta: string, unidad: string, x: number): readonly CeldaPdf[] {
  return [
    { valor: '#', x: x + 8 },
    { valor: etiqueta, x: x + 26 },
    { valor: `Total (${unidad})`, x: x + COLUMNA.ancho - 8, alinear: 'derecha' },
  ]
}

function celdasRanking(item: RankingItem, index: number, x: number): readonly CeldaPdf[] {
  return [
    { valor: String(index + 1), x: x + 8, color: PDF_COLORES.secundario },
    { valor: acortarTextoPdf({ valor: item.etiqueta, anchoMaximo: RANKING.anchoEtiqueta, size: PDF_TIPO.cuerpo }), x: x + 26 },
    { valor: formatearNumeroPdf(item.valor), x: x + COLUMNA.ancho - 8, alinear: 'derecha', peso: 'negrita' },
  ]
}

function pintarTendencia({ tendenciaDiaria, unidad }: DashboardUnidad, y: number): string {
  const top = y - PDF_ESPACIO.md
  const seccion = pintarTituloSeccionPdf({ titulo: `Produccion diaria del mes (${unidad})`, y })
  if (tendenciaDiaria.length === 0) return [seccion, pintarVacioTablaPdf({ mensaje: 'Sin produccion registrada este mes.', y: top })].join('\n')
  const visibles = tendenciaDiaria.slice(0, TENDENCIA.visibles)
  const filas = Array.from({ length: Math.ceil(visibles.length / TENDENCIA.porFila) }, (_item, index) =>
    pintarFilaTablaPdf({ celdas: celdasTendencia(visibles, index), y: topFilaPdf(top, index), index }),
  )
  return [seccion, pintarEncabezadoTablaPdf({ columnas: columnasTendencia(unidad), y: top }), ...filas].join('\n')
}

function columnasTendencia(unidad: string): readonly CeldaPdf[] {
  return [0, 1].flatMap((par) => [
    { valor: 'Fecha', x: PDF_PAGINA.margen + 8 + par * TENDENCIA.separacion },
    { valor: `Cantidad (${unidad})`, x: PDF_PAGINA.margen + COLUMNA.ancho - 8 + par * TENDENCIA.separacion, alinear: 'derecha' as const },
  ])
}

function celdasTendencia(puntos: readonly TendenciaPunto[], fila: number): readonly CeldaPdf[] {
  return [0, 1].flatMap((par) => {
    const punto = puntos[fila * TENDENCIA.porFila + par]
    if (!punto) return []
    return [
      { valor: punto.fecha, x: PDF_PAGINA.margen + 8 + par * TENDENCIA.separacion, color: PDF_COLORES.secundario },
      { valor: formatearNumeroPdf(punto.valor), x: PDF_PAGINA.margen + COLUMNA.ancho - 8 + par * TENDENCIA.separacion, alinear: 'derecha' as const, peso: 'negrita' as const },
    ]
  })
}

export function formatearNumeroPdf(valor: number): string {
  return valor.toLocaleString('es-CL', { maximumFractionDigits: 1 })
}
