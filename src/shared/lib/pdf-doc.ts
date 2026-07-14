import { quitarDiacriticos } from '../utils/quitar-diacriticos'

export function textoPdf(valor: string, x: number, y: number, size: number, color: string): string {
  return `${color} rg\nBT\n/F1 ${size} Tf\n${x} ${y} Td\n(${escaparTextoPdf(valor)}) Tj\nET`
}

export function crearBlobPdf(stream: string, anchoPagina: number, altoPagina: number): Blob {
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [4 0 R] /Count 1 >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${anchoPagina} ${altoPagina}] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ]
  return new Blob([crearDocumentoPdf(objetos)], { type: 'application/pdf' })
}

function escaparTextoPdf(textoPdf: string): string {
  return quitarDiacriticos(textoPdf).replace(/[()\\]/g, '\\$&')
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
