import { DIAS_SEMANA } from '../constants/calendario.constants'
import type { AsistenciaConTrabajador } from '../types/asistencia.types'
import { obtenerEspaciosCalendario } from './obtener-espacios-calendario'
import { construirFechaIso } from '../../captura/utils/fecha-iso'
import { MESES } from '../../captura/constants/meses.constants'
import { obtenerDiasEnMes } from '../../captura/utils/obtener-dias-en-mes'

const PAGE = { width: 595, height: 842, margin: 40 }
const GRID = { x: 40, y: 102, width: 515, rowHeight: 92 }
const CELL_WIDTH = GRID.width / 7

interface GenerarPdfAusenciasInput {
  registros: readonly AsistenciaConTrabajador[]
  fincaNombre: string
  anio: number
  mes: number
}

export function generarPdfAusencias(input: GenerarPdfAusenciasInput): Blob {
  const stream = crearStream(input)
  const objetos = crearObjetos(stream)
  return new Blob([crearDocumentoPdf(objetos)], { type: 'application/pdf' })
}

function crearStream(input: GenerarPdfAusenciasInput): string {
  return [pintarFondo(), pintarEncabezado(input), pintarResumen(input.registros), pintarCalendario(input), pintarPie()].join('\n')
}

function pintarFondo(): string {
  return ''
}

function pintarEncabezado({ fincaNombre, anio, mes }: GenerarPdfAusenciasInput): string {
  const mesNombre = MESES.find((item) => item.valor === mes)?.nombre ?? 'Mes'
  return [texto('Registro mensual de ausentes', 48, 778, 22, '0 0 0'), texto(fincaNombre, 48, 750, 13, '0.20 0.20 0.20'), texto(`${mesNombre} ${anio}`, 420, 778, 16, '0 0 0')].join('\n')
}

function pintarResumen(registros: readonly AsistenciaConTrabajador[]): string {
  const trabajadores = new Set(registros.map((registro) => registro.trabajadorId)).size
  return [cajaResumen(48, 'Ausencias', registros.length), cajaResumen(202, 'Trabajadores', trabajadores), cajaResumen(356, 'Dias con ausentes', contarDias(registros))].join('\n')
}

function cajaResumen(x: number, titulo: string, valor: number): string {
  return ['0.78 0.78 0.78 RG', `${x} 682 132 46 re S`, texto(titulo, x + 12, 710, 9, '0.25 0.25 0.25'), texto(String(valor), x + 12, 690, 18, '0 0 0')].join('\n')
}

function pintarCalendario(input: GenerarPdfAusenciasInput): string {
  const grupos = agruparPorFecha(input.registros)
  return [pintarDiasSemana(), ...crearCeldas(input, grupos)].join('\n')
}

function pintarDiasSemana(): string {
  return DIAS_SEMANA.map((dia, index) => texto(dia, GRID.x + index * CELL_WIDTH + 28, 650, 10, '0.25 0.25 0.25')).join('\n')
}

function crearCeldas(input: GenerarPdfAusenciasInput, grupos: Map<string, AsistenciaConTrabajador[]>): string[] {
  const espacios = obtenerEspaciosCalendario(input.anio, input.mes)
  const dias = obtenerDiasEnMes(input.anio, input.mes)
  return Array.from({ length: 42 }, (_item, index) => pintarCelda(index, index - espacios + 1, dias, input, grupos))
}

function pintarCelda(index: number, dia: number, dias: number, input: GenerarPdfAusenciasInput, grupos: Map<string, AsistenciaConTrabajador[]>): string {
  const x = GRID.x + (index % 7) * CELL_WIDTH
  const y = 548 - Math.floor(index / 7) * GRID.rowHeight
  if (dia < 1 || dia > dias) return pintarCajaDia(x, y)
  const fecha = construirFechaIso({ anio: input.anio, mes: input.mes, dia })
  const registros = grupos.get(fecha) ?? []
  return [pintarCajaDia(x, y), pintarDia(x, y, dia, registros.length), pintarAusentes(x, y, registros)].join('\n')
}

function pintarCajaDia(x: number, y: number): string {
  return ['0.78 0.78 0.78 RG', `${x} ${y} ${CELL_WIDTH - 4} ${GRID.rowHeight - 6} re S`].join('\n')
}

function pintarDia(x: number, y: number, dia: number, totalAusentes: number): string {
  const contador = totalAusentes > 0 ? texto(String(totalAusentes), x + 55, y + 70, 8, '0 0 0') : ''
  return [texto(String(dia), x + 8, y + 72, 12, '0 0 0'), contador].join('\n')
}

function pintarAusentes(x: number, y: number, registros: readonly AsistenciaConTrabajador[]): string {
  if (registros.length === 0) return texto('Sin ausentes', x + 8, y + 48, 8, '0.55 0.55 0.55')
  const nombres = registros.slice(0, 3).map((registro, index) => pintarNombreAusente(x + 7, y + 48 - index * 15, registro.trabajadorNombre))
  if (registros.length > 3) nombres.push(texto(`+${registros.length - 3} mas ausentes`, x + 9, y + 7, 8, '0.20 0.20 0.20'))
  return nombres.join('\n')
}

function pintarNombreAusente(x: number, y: number, nombre: string): string {
  return texto(acortar(nombre), x + 3, y, 7, '0 0 0')
}

function pintarPie(): string {
  return texto(`Generado: ${formatearFecha(new Date().toISOString().slice(0, 10))}`, PAGE.margin, 42, 9, '0.35 0.35 0.35')
}

function crearObjetos(stream: string): string[] {
  return ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [4 0 R] /Count 1 >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>`, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`]
}

function texto(valor: string, x: number, y: number, size: number, color: string): string {
  return `${color} rg\nBT\n/F1 ${size} Tf\n${x} ${y} Td\n(${escaparTextoPdf(valor)}) Tj\nET`
}

function agruparPorFecha(registros: readonly AsistenciaConTrabajador[]): Map<string, AsistenciaConTrabajador[]> {
  const grupos = new Map<string, AsistenciaConTrabajador[]>()
  registros.forEach((registro) => grupos.set(registro.fecha, [...(grupos.get(registro.fecha) ?? []), registro]))
  return grupos
}

function contarDias(registros: readonly AsistenciaConTrabajador[]): number {
  return new Set(registros.map((registro) => registro.fecha)).size
}

function crearDocumentoPdf(objetos: readonly string[]): string {
  const partes = ['%PDF-1.4\n']
  const offsets: number[] = []
  objetos.forEach((objeto, index) => {
    offsets.push(partes.join('').length)
    partes.push(`${index + 1} 0 obj\n${objeto}\nendobj\n`)
  })
  const inicioXref = partes.join('').length
  partes.push(crearXref(offsets), `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`)
  return partes.join('')
}

function crearXref(offsets: readonly number[]): string {
  const filas = offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')
  return `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n${filas}\n`
}

function acortar(textoCompleto: string): string {
  return textoCompleto.length > 16 ? `${textoCompleto.slice(0, 14)}...` : textoCompleto
}

function escaparTextoPdf(textoPdf: string): string {
  return textoPdf.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[()\\]/g, '\\$&')
}

function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}
