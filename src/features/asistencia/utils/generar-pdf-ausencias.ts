import { DIAS_SEMANA } from '../constants/calendario.constants'
import type { AsistenciaConTrabajador } from '../types/asistencia.types'
import { obtenerEspaciosCalendario } from './obtener-espacios-calendario'
import { construirFechaIso, formatearFechaIsoDdMmAaaa } from '../../../shared/utils/fecha-iso'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'
import { MESES } from '../../captura/constants/meses.constants'
import { obtenerDiasEnMes } from '../../captura/utils/obtener-dias-en-mes'
import { textoPdf as texto, crearBlobPdf } from '../../../shared/lib/pdf-doc'
import { acortarTextoPdf } from '../../../shared/lib/pdf-texto'
import { PDF_COLORES, PDF_ESPACIO, PDF_LAYOUT, PDF_PAGINA, PDF_TIPO, pintarEncabezadoPdf, pintarFondoPdf, pintarPiePdf, pintarTarjetaResumenPdf, rectanguloPdf } from '../../../shared/utils/pdf/estilos-pdf'

const RESUMEN_BOTTOM = PDF_LAYOUT.contenidoTop - PDF_LAYOUT.tarjetaAlto
const SEMANA = { top: RESUMEN_BOTTOM - PDF_ESPACIO.md, alto: 24 }
const GRID = { top: SEMANA.top - SEMANA.alto, filas: 6, columnas: 7, altoFila: 90 }
const CELDA = { ancho: PDF_PAGINA.contenido / GRID.columnas - 5, alto: GRID.altoFila - 6, padding: 8 }
const NOMBRES = { visibles: 3, primeraY: 52, interlineado: 12, tamano: 7 }

interface GenerarPdfAusenciasInput {
  registros: readonly AsistenciaConTrabajador[]
  fincaNombre: string
  anio: number
  mes: number
}

export function generarPdfAusencias(input: GenerarPdfAusenciasInput): Blob {
  return crearBlobPdf(crearStream(input), PDF_PAGINA.ancho, PDF_PAGINA.alto)
}

function crearStream(input: GenerarPdfAusenciasInput): string {
  return [pintarFondoPdf(), pintarEncabezado(input), pintarResumen(input.registros), pintarCalendario(input), pintarPiePdf(formatearFechaIsoDdMmAaaa(fechaLocalIso()))].join('\n')
}

function pintarEncabezado({ fincaNombre, anio, mes }: GenerarPdfAusenciasInput): string {
  const mesNombre = MESES.find((item) => item.valor === mes)?.nombre ?? 'Mes'
  return pintarEncabezadoPdf({ titulo: 'Registro mensual de ausencias', subtitulo: `${fincaNombre} | ${mesNombre} ${anio}`, meta: 'CONTROL DE ASISTENCIA' })
}

function pintarResumen(registros: readonly AsistenciaConTrabajador[]): string {
  const ancho = (PDF_PAGINA.contenido - 2 * PDF_ESPACIO.sm) / 3
  const items = [
    { titulo: 'Ausencias', valor: registros.length },
    { titulo: 'Trabajadores', valor: new Set(registros.map((registro) => registro.trabajadorId)).size },
    { titulo: 'Dias con ausentes', valor: new Set(registros.map((registro) => registro.fecha)).size },
  ]
  return items
    .map((item, index) =>
      pintarTarjetaResumenPdf({ x: PDF_PAGINA.margen + index * (ancho + PDF_ESPACIO.sm), y: RESUMEN_BOTTOM, ancho, alto: PDF_LAYOUT.tarjetaAlto, titulo: item.titulo, valor: String(item.valor) }),
    )
    .join('\n')
}

function pintarCalendario(input: GenerarPdfAusenciasInput): string {
  const grupos = agruparPorFecha(input.registros)
  return [pintarDiasSemana(), ...crearCeldas(input, grupos)].join('\n')
}

function pintarDiasSemana(): string {
  const fondo = rectanguloPdf({ x: PDF_PAGINA.margen, y: GRID.top, ancho: PDF_PAGINA.contenido, alto: SEMANA.alto, relleno: PDF_COLORES.verdeOscuro })
  const dias = DIAS_SEMANA.map((dia, index) =>
    texto({ valor: dia, x: columnaX(index) + CELDA.ancho / 2, y: GRID.top + 9, size: PDF_TIPO.tabla, color: PDF_COLORES.blanco, peso: 'negrita', alinear: 'centro' }),
  )
  return [fondo, ...dias].join('\n')
}

function crearCeldas(input: GenerarPdfAusenciasInput, grupos: Map<string, AsistenciaConTrabajador[]>): string[] {
  const espacios = obtenerEspaciosCalendario(input.anio, input.mes)
  const dias = obtenerDiasEnMes(input.anio, input.mes)
  return Array.from({ length: GRID.filas * GRID.columnas }, (_item, index) => pintarCelda(index, index - espacios + 1, dias, input, grupos))
}

function pintarCelda(index: number, dia: number, dias: number, input: GenerarPdfAusenciasInput, grupos: Map<string, AsistenciaConTrabajador[]>): string {
  const x = columnaX(index % GRID.columnas)
  const y = GRID.top - (Math.floor(index / GRID.columnas) + 1) * GRID.altoFila
  const caja = rectanguloPdf({ x, y, ancho: CELDA.ancho, alto: CELDA.alto, relleno: PDF_COLORES.superficie, borde: PDF_COLORES.borde })
  if (dia < 1 || dia > dias) return caja
  const registros = grupos.get(construirFechaIso({ anio: input.anio, mes: input.mes, dia })) ?? []
  return [caja, pintarDia(x, y, dia, registros.length), pintarAusentes(x, y, registros)].join('\n')
}

function pintarDia(x: number, y: number, dia: number, totalAusentes: number): string {
  const y0 = y + CELDA.alto - 16
  const contador = totalAusentes > 0 ? texto({ valor: `${totalAusentes} aus.`, x: x + CELDA.ancho - CELDA.padding, y: y0, size: NOMBRES.tamano, color: PDF_COLORES.rojo, peso: 'negrita', alinear: 'derecha' }) : ''
  return [texto({ valor: String(dia), x: x + CELDA.padding, y: y0, size: 11, color: PDF_COLORES.texto, peso: 'negrita' }), contador].join('\n')
}

function pintarAusentes(x: number, y: number, registros: readonly AsistenciaConTrabajador[]): string {
  if (registros.length === 0) return texto({ valor: 'Sin ausencias', x: x + CELDA.padding, y: y + NOMBRES.primeraY, size: NOMBRES.tamano, color: PDF_COLORES.secundario })
  const anchoMaximo = CELDA.ancho - CELDA.padding * 2
  const nombres = registros.slice(0, NOMBRES.visibles).map((registro, index) =>
    texto({
      valor: acortarTextoPdf({ valor: registro.trabajadorNombre, anchoMaximo, size: NOMBRES.tamano }),
      x: x + CELDA.padding,
      y: y + NOMBRES.primeraY - index * NOMBRES.interlineado,
      size: NOMBRES.tamano,
      color: PDF_COLORES.texto,
    }),
  )
  if (registros.length > NOMBRES.visibles) {
    nombres.push(texto({ valor: `+${registros.length - NOMBRES.visibles} mas`, x: x + CELDA.padding, y: y + 10, size: NOMBRES.tamano, color: PDF_COLORES.rojo, peso: 'negrita' }))
  }
  return nombres.join('\n')
}

function columnaX(columna: number): number {
  return PDF_PAGINA.margen + (columna * PDF_PAGINA.contenido) / GRID.columnas
}

function agruparPorFecha(registros: readonly AsistenciaConTrabajador[]): Map<string, AsistenciaConTrabajador[]> {
  const grupos = new Map<string, AsistenciaConTrabajador[]>()
  registros.forEach((registro) => grupos.set(registro.fecha, [...(grupos.get(registro.fecha) ?? []), registro]))
  return grupos
}
