import { capitalizar } from '../capitalizar'
import { acortarTextoPdf } from '../../lib/pdf-texto'
import { crearBlobPdf } from '../../lib/pdf-doc'
import { formatearFechaIsoDdMmAaaa } from '../fecha-iso'
import { fechaLocalIso } from '../fecha-local'
import type { DashboardKpis, RankingItem, TendenciaPunto } from '../../types/kpis.types'
import { PDF_COLORES, PDF_ESPACIO, PDF_LAYOUT, PDF_PAGINA, PDF_TIPO, pintarEncabezadoPdf, pintarFondoPdf, pintarPiePdf, pintarTarjetaResumenPdf, pintarTituloSeccionPdf } from './estilos-pdf'
import { altoTablaPdf, pintarEncabezadoTablaPdf, pintarFilaTablaPdf, pintarVacioTablaPdf, topFilaPdf, type CeldaPdf } from './tabla-pdf'

const KPI = { columnas: 4, gap: PDF_ESPACIO.sm }
const COLUMNA = { ancho: 248, izquierda: PDF_PAGINA.margen, derecha: 307 }
const RANKING = { visibles: 5, anchoEtiqueta: 148 }
const TENDENCIA = { visibles: 12, porFila: 2, separacion: 267 }

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
  return crearBlobPdf(crearStream(input), PDF_PAGINA.ancho, PDF_PAGINA.alto)
}

function crearStream(input: GenerarPdfDashboardInput): string {
  const tarjetas = construirTarjetasKpi(input.kpis)
  const rankingTitulo = bottomResumen(tarjetas.length) - PDF_ESPACIO.lg
  const rankingTabla = rankingTitulo - PDF_ESPACIO.md
  const filasRanking = Math.min(Math.max(input.rankingLabores.length, input.rankingTrabajadores.length, 1), RANKING.visibles)
  const tendenciaTitulo = rankingTabla - altoTablaPdf(filasRanking) - PDF_ESPACIO.lg

  return [
    pintarFondoPdf(),
    pintarEncabezadoPdf({ titulo: input.titulo, subtitulo: input.subtitulo, meta: 'REPORTE DE GESTION' }),
    pintarResumen(tarjetas),
    pintarRanking({ titulo: 'Mejor labor del mes', etiqueta: 'Labor', items: input.rankingLabores, x: COLUMNA.izquierda, y: rankingTitulo }),
    pintarRanking({ titulo: 'Mejor trabajador del mes', etiqueta: 'Trabajador', items: input.rankingTrabajadores, x: COLUMNA.derecha, y: rankingTitulo }),
    pintarTendencia(input.tendenciaDiaria, tendenciaTitulo),
    pintarPiePdf(formatearFechaIsoDdMmAaaa(fechaLocalIso())),
  ].join('\n')
}

function construirTarjetasKpi(kpis: DashboardKpis): TarjetaKpi[] {
  return [
    { titulo: 'Horas del mes', valor: formatearNumero(kpis.totalHoras) },
    { titulo: 'Trabajadores activos', valor: String(kpis.trabajadoresActivos) },
    ...kpis.cantidadesPorUnidad.map((item) => ({ titulo: `${capitalizar(item.unidad)} producidos`, valor: formatearNumero(item.totalCantidad) })),
    // "Productividad (cajas/hora)" no entra en el ancho de tarjeta con 4 columnas
    ...kpis.cantidadesPorUnidad.map((item) => ({ titulo: `Prod. (${item.unidad}/hora)`, valor: item.productividadPromedio.toFixed(1) })),
  ]
}

function pintarResumen(tarjetas: readonly TarjetaKpi[]): string {
  const ancho = (PDF_PAGINA.contenido - (KPI.columnas - 1) * KPI.gap) / KPI.columnas
  return tarjetas
    .map((tarjeta, index) =>
      pintarTarjetaResumenPdf({
        x: PDF_PAGINA.margen + (index % KPI.columnas) * (ancho + KPI.gap),
        y: PDF_LAYOUT.contenidoTop - Math.floor(index / KPI.columnas) * (PDF_LAYOUT.tarjetaAlto + KPI.gap) - PDF_LAYOUT.tarjetaAlto,
        ancho,
        alto: PDF_LAYOUT.tarjetaAlto,
        titulo: tarjeta.titulo,
        valor: tarjeta.valor,
      }),
    )
    .join('\n')
}

function bottomResumen(totalTarjetas: number): number {
  const filas = Math.ceil(totalTarjetas / KPI.columnas)
  return PDF_LAYOUT.contenidoTop - (filas - 1) * (PDF_LAYOUT.tarjetaAlto + KPI.gap) - PDF_LAYOUT.tarjetaAlto
}

function pintarRanking({ titulo, etiqueta, items, x, y }: { titulo: string; etiqueta: string; items: readonly RankingItem[]; x: number; y: number }): string {
  const geometria = { x, ancho: COLUMNA.ancho }
  const top = y - PDF_ESPACIO.md
  const seccion = pintarTituloSeccionPdf({ titulo, x, y, ancho: COLUMNA.ancho })
  if (items.length === 0) return [seccion, pintarVacioTablaPdf({ mensaje: 'Sin datos del mes.', y: top, ...geometria })].join('\n')
  const filas = items.slice(0, RANKING.visibles).map((item, index) => pintarFilaTablaPdf({ celdas: celdasRanking(item, index, x), y: topFilaPdf(top, index), index, ...geometria }))
  return [seccion, pintarEncabezadoTablaPdf({ columnas: columnasRanking(etiqueta, x), y: top, ...geometria }), ...filas].join('\n')
}

function columnasRanking(etiqueta: string, x: number): readonly CeldaPdf[] {
  return [
    { valor: '#', x: x + 8 },
    { valor: etiqueta, x: x + 26 },
    { valor: 'Total', x: x + COLUMNA.ancho - 8, alinear: 'derecha' },
  ]
}

function celdasRanking(item: RankingItem, index: number, x: number): readonly CeldaPdf[] {
  return [
    { valor: String(index + 1), x: x + 8, color: PDF_COLORES.secundario },
    { valor: acortarTextoPdf({ valor: item.etiqueta, anchoMaximo: RANKING.anchoEtiqueta, size: PDF_TIPO.cuerpo }), x: x + 26 },
    { valor: formatearNumero(item.valor), x: x + COLUMNA.ancho - 8, alinear: 'derecha', peso: 'negrita' },
  ]
}

function pintarTendencia(puntos: readonly TendenciaPunto[], y: number): string {
  const top = y - PDF_ESPACIO.md
  const seccion = pintarTituloSeccionPdf({ titulo: 'Produccion diaria del mes', y })
  if (puntos.length === 0) return [seccion, pintarVacioTablaPdf({ mensaje: 'Sin produccion registrada este mes.', y: top })].join('\n')
  const visibles = puntos.slice(0, TENDENCIA.visibles)
  const filas = Array.from({ length: Math.ceil(visibles.length / TENDENCIA.porFila) }, (_item, index) =>
    pintarFilaTablaPdf({ celdas: celdasTendencia(visibles, index), y: topFilaPdf(top, index), index }),
  )
  return [seccion, pintarEncabezadoTablaPdf({ columnas: columnasTendencia(), y: top }), ...filas].join('\n')
}

function columnasTendencia(): readonly CeldaPdf[] {
  return [0, 1].flatMap((par) => [
    { valor: 'Fecha', x: PDF_PAGINA.margen + 8 + par * TENDENCIA.separacion },
    { valor: 'Cantidad', x: PDF_PAGINA.margen + COLUMNA.ancho - 8 + par * TENDENCIA.separacion, alinear: 'derecha' as const },
  ])
}

function celdasTendencia(puntos: readonly TendenciaPunto[], fila: number): readonly CeldaPdf[] {
  return [0, 1].flatMap((par) => {
    const punto = puntos[fila * TENDENCIA.porFila + par]
    if (!punto) return []
    return [
      { valor: punto.fecha, x: PDF_PAGINA.margen + 8 + par * TENDENCIA.separacion, color: PDF_COLORES.secundario },
      { valor: formatearNumero(punto.valor), x: PDF_PAGINA.margen + COLUMNA.ancho - 8 + par * TENDENCIA.separacion, alinear: 'derecha' as const, peso: 'negrita' as const },
    ]
  })
}

function formatearNumero(valor: number): string {
  return valor.toLocaleString('es-CL', { maximumFractionDigits: 1 })
}
