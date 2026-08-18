import { medirTextoPdf, normalizarTextoPdf, type PesoPdf } from './pdf-texto'

export type { PesoPdf }
export type AlineacionPdf = 'izquierda' | 'centro' | 'derecha'

export interface TextoPdfInput {
  valor: string
  x: number
  y: number
  size: number
  color: string
  peso?: PesoPdf
  // 'derecha' y 'centro' interpretan x como borde derecho y centro del texto.
  alinear?: AlineacionPdf
}

const FUENTE: Record<PesoPdf, string> = { normal: '/F1', negrita: '/F2' }
const DECIMALES = 100

export function textoPdf({ valor, x, y, size, color, peso = 'normal', alinear = 'izquierda' }: TextoPdfInput): string {
  const inicio = redondear(xInicial({ ancho: medirTextoPdf(valor, size, peso), x, alinear }))
  return `${color} rg\nBT\n${FUENTE[peso]} ${size} Tf\n${inicio} ${redondear(y)} Td\n(${escaparTextoPdf(valor)}) Tj\nET`
}

export function crearBlobPdf(stream: string, anchoPagina: number, altoPagina: number): Blob {
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [4 0 R] /Count 1 >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${anchoPagina} ${altoPagina}] /Resources << /Font << /F1 3 0 R /F2 6 0 R >> >> /Contents 5 0 R >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ]
  return new Blob([crearDocumentoPdf(objetos)], { type: 'application/pdf' })
}

function xInicial({ ancho, x, alinear }: { ancho: number; x: number; alinear: AlineacionPdf }): number {
  if (alinear === 'derecha') return x - ancho
  if (alinear === 'centro') return x - ancho / 2
  return x
}

function redondear(valor: number): number {
  return Math.round(valor * DECIMALES) / DECIMALES
}

function escaparTextoPdf(valor: string): string {
  return normalizarTextoPdf(valor).replace(/[()\\]/g, '\\$&')
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
