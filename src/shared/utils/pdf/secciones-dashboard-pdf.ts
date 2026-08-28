import { acortarTextoPdf } from '../../lib/pdf-texto'
import { formatearCantidad } from '../formatear-cantidad'
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
  sufijoUnidad: string
  x: number
  y: number
}

// Un bloque por unidad: cajas y tramos no se suman, asi que cada seccion dice de que
// unidad esta hablando en el titulo y en el encabezado de la columna de totales.
// `bloque` en null es el mes sin ninguna produccion: sigue pintando las tres secciones en
// estado vacio y sin sufijo, en vez de dejar media pagina en blanco.
export function pintarSeccionesUnidadPdf(bloque: DashboardUnidad | null, top: number): string {
  const sufijoUnidad = bloque === null ? '' : ` (${bloque.unidad})`
  const labores = bloque?.rankingLabores ?? []
  const trabajadores = bloque?.rankingTrabajadores ?? []
  const rankingTabla = top - PDF_ESPACIO.lg - PDF_ESPACIO.md
  const filas = Math.min(Math.max(labores.length, trabajadores.length, 1), RANKING.visibles)
  const comun = { sufijoUnidad, y: top - PDF_ESPACIO.lg }

  return [
    pintarRanking({ titulo: `Mejor labor${sufijoUnidad}`, etiqueta: 'Labor', items: labores, x: COLUMNA.izquierda, ...comun }),
    pintarRanking({ titulo: `Mejor trabajador${sufijoUnidad}`, etiqueta: 'Trabajador', items: trabajadores, x: COLUMNA.derecha, ...comun }),
    pintarTendencia(bloque?.tendenciaDiaria ?? [], sufijoUnidad, rankingTabla - altoTablaPdf(filas) - PDF_ESPACIO.lg),
  ].join('\n')
}

function pintarRanking({ titulo, etiqueta, items, sufijoUnidad, x, y }: RankingPdfInput): string {
  const geometria = { x, ancho: COLUMNA.ancho }
  const top = y - PDF_ESPACIO.md
  const seccion = pintarTituloSeccionPdf({ titulo, x, y, ancho: COLUMNA.ancho })
  if (items.length === 0) return [seccion, pintarVacioTablaPdf({ mensaje: 'Sin datos del mes.', y: top, ...geometria })].join('\n')
  const filas = items.slice(0, RANKING.visibles).map((item, index) => pintarFilaTablaPdf({ celdas: celdasRanking(item, index, x), y: topFilaPdf(top, index), index, ...geometria }))
  return [seccion, pintarEncabezadoTablaPdf({ columnas: columnasRanking(etiqueta, sufijoUnidad, x), y: top, ...geometria }), ...filas].join('\n')
}

function columnasRanking(etiqueta: string, sufijoUnidad: string, x: number): readonly CeldaPdf[] {
  return [
    { valor: '#', x: x + 8 },
    { valor: etiqueta, x: x + 26 },
    { valor: `Total${sufijoUnidad}`, x: x + COLUMNA.ancho - 8, alinear: 'derecha' },
  ]
}

function celdasRanking(item: RankingItem, index: number, x: number): readonly CeldaPdf[] {
  return [
    { valor: String(index + 1), x: x + 8, color: PDF_COLORES.secundario },
    { valor: acortarTextoPdf({ valor: item.etiqueta, anchoMaximo: RANKING.anchoEtiqueta, size: PDF_TIPO.cuerpo }), x: x + 26 },
    { valor: formatearCantidad(item.valor), x: x + COLUMNA.ancho - 8, alinear: 'derecha', peso: 'negrita' },
  ]
}

function pintarTendencia(tendencia: readonly TendenciaPunto[], sufijoUnidad: string, y: number): string {
  const top = y - PDF_ESPACIO.md
  const seccion = pintarTituloSeccionPdf({ titulo: `Produccion diaria del mes${sufijoUnidad}`, y })
  if (tendencia.length === 0) return [seccion, pintarVacioTablaPdf({ mensaje: 'Sin produccion registrada este mes.', y: top })].join('\n')
  const visibles = tendencia.slice(0, TENDENCIA.visibles)
  const filas = Array.from({ length: Math.ceil(visibles.length / TENDENCIA.porFila) }, (_item, index) =>
    pintarFilaTablaPdf({ celdas: celdasTendencia(visibles, index), y: topFilaPdf(top, index), index }),
  )
  return [seccion, pintarEncabezadoTablaPdf({ columnas: columnasTendencia(sufijoUnidad), y: top }), ...filas].join('\n')
}

function columnasTendencia(sufijoUnidad: string): readonly CeldaPdf[] {
  return [0, 1].flatMap((par) => [
    { valor: 'Fecha', x: PDF_PAGINA.margen + 8 + par * TENDENCIA.separacion },
    { valor: `Cantidad${sufijoUnidad}`, x: PDF_PAGINA.margen + COLUMNA.ancho - 8 + par * TENDENCIA.separacion, alinear: 'derecha' as const },
  ])
}

function celdasTendencia(puntos: readonly TendenciaPunto[], fila: number): readonly CeldaPdf[] {
  return [0, 1].flatMap((par) => {
    const punto = puntos[fila * TENDENCIA.porFila + par]
    if (!punto) return []
    return [
      { valor: punto.fecha, x: PDF_PAGINA.margen + 8 + par * TENDENCIA.separacion, color: PDF_COLORES.secundario },
      { valor: formatearCantidad(punto.valor), x: PDF_PAGINA.margen + COLUMNA.ancho - 8 + par * TENDENCIA.separacion, alinear: 'derecha' as const, peso: 'negrita' as const },
    ]
  })
}
