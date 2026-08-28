import { capitalizar } from '../capitalizar'
import { formatearCantidad } from '../formatear-cantidad'
import { crearBlobPdf } from '../../lib/pdf-doc'
import { formatearFechaIsoDdMmAaaa } from '../fecha-iso'
import { fechaLocalIso } from '../fecha-local'
import type { DashboardKpis, DashboardUnidad } from '../../types/kpis.types'
import { PDF_ESPACIO, PDF_LAYOUT, PDF_PAGINA, pintarEncabezadoPdf, pintarFondoPdf, pintarPiePdf, pintarTarjetaResumenPdf } from './estilos-pdf'
import { pintarSeccionesUnidadPdf } from './secciones-dashboard-pdf'

const KPI = { columnas: 4, gap: PDF_ESPACIO.sm }
const META = 'REPORTE DE GESTION'

interface GenerarPdfDashboardInput {
  titulo: string
  subtitulo: string
  kpis: DashboardKpis
  porUnidad: readonly DashboardUnidad[]
}

interface TarjetaKpi {
  titulo: string
  valor: string
}

export function generarPdfDashboard(input: GenerarPdfDashboardInput): Blob {
  return crearBlobPdf(crearPaginas(input), PDF_PAGINA.ancho, PDF_PAGINA.alto)
}

// Una pagina por unidad de medida. Meter cajas y tramos en la misma tabla obligaba a
// rotular el total como "unidades", que no dice nada; y las dos no entran en una pagina.
function crearPaginas(input: GenerarPdfDashboardInput): string[] {
  const tarjetas = construirTarjetasKpi(input.kpis)
  // Un mes sin produccion sigue siendo una pagina: `bloque` null pinta los estados vacios.
  if (input.porUnidad.length === 0) return [crearPagina({ input, tarjetas, bloque: null })]
  return input.porUnidad.map((bloque, index) => crearPagina({ input, tarjetas: index === 0 ? tarjetas : [], bloque }))
}

// Las tarjetas de KPI van solo en la primera pagina: son del mes entero, no de la unidad.
function crearPagina({ input, tarjetas, bloque }: { input: GenerarPdfDashboardInput; tarjetas: readonly TarjetaKpi[]; bloque: DashboardUnidad | null }): string {
  const subtitulo = bloque === null ? input.subtitulo : `${input.subtitulo} — ${bloque.unidad}`
  return [
    pintarFondoPdf(),
    pintarEncabezadoPdf({ titulo: input.titulo, subtitulo, meta: META }),
    pintarResumen(tarjetas),
    pintarSeccionesUnidadPdf(bloque, bottomResumen(tarjetas.length)),
    pintarPiePdf(formatearFechaIsoDdMmAaaa(fechaLocalIso())),
  ].join('\n')
}

function construirTarjetasKpi(kpis: DashboardKpis): TarjetaKpi[] {
  return [
    { titulo: 'Horas del mes', valor: formatearCantidad(kpis.totalHoras) },
    { titulo: 'Trabajadores activos', valor: String(kpis.trabajadoresActivos) },
    ...kpis.cantidadesPorUnidad.map((item) => ({ titulo: `${capitalizar(item.unidad)} producidos`, valor: formatearCantidad(item.totalCantidad) })),
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

// Sin tarjetas el contenido arranca arriba de todo, no bajo una fila de altura fantasma.
function bottomResumen(totalTarjetas: number): number {
  if (totalTarjetas === 0) return PDF_LAYOUT.contenidoTop
  const filas = Math.ceil(totalTarjetas / KPI.columnas)
  return PDF_LAYOUT.contenidoTop - (filas - 1) * (PDF_LAYOUT.tarjetaAlto + KPI.gap) - PDF_LAYOUT.tarjetaAlto
}
