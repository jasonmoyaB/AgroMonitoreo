import { quitarDiacriticos } from '../utils/quitar-diacriticos'

export type PesoPdf = 'normal' | 'negrita'

const PRIMER_CODIGO = 32
const ANCHO_FALLBACK = 556
const MILESIMAS = 1000

// Anchos oficiales (AFM) de Helvetica y Helvetica-Bold en milesimas de em, de ' ' (32) a '~' (126).
// El texto se normaliza antes a ASCII imprimible, asi que la tabla cubre todo lo que puede llegar.
const ANCHOS: Record<PesoPdf, readonly number[]> = {
  normal: [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015,
    667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611,
    278, 278, 278, 469, 556, 333,
    556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500,
    334, 260, 334, 584,
  ],
  negrita: [
    278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975,
    722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611,
    333, 278, 333, 584, 556, 333,
    556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500,
    389, 280, 389, 584,
  ],
}

// El motor no incrusta fuentes: Helvetica solo tiene ASCII imprimible, asi que todo
// lo demas (tildes, comillas tipograficas, el simbolo de colones) se traduce aca.
export function normalizarTextoPdf(valor: string): string {
  return quitarDiacriticos(valor)
    .replace(/₡/g, 'CRC ')
    .replace(/[  ]/g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7e]/g, '?')
}

export function medirTextoPdf(valor: string, size: number, peso: PesoPdf = 'normal'): number {
  const anchos = ANCHOS[peso]
  const total = [...normalizarTextoPdf(valor)].reduce((suma, caracter) => suma + (anchos[caracter.charCodeAt(0) - PRIMER_CODIGO] ?? ANCHO_FALLBACK), 0)
  return (total * size) / MILESIMAS
}

interface AcortarTextoPdfInput {
  valor: string
  anchoMaximo: number
  size: number
  peso?: PesoPdf
}

// Corta por ancho real, no por cantidad de caracteres: "Wilberth" y "lili" no ocupan lo mismo.
export function acortarTextoPdf({ valor, anchoMaximo, size, peso = 'normal' }: AcortarTextoPdfInput): string {
  if (medirTextoPdf(valor, size, peso) <= anchoMaximo) return valor
  const anchoPuntos = medirTextoPdf('...', size, peso)
  let recortado = normalizarTextoPdf(valor)
  while (recortado.length > 0 && medirTextoPdf(recortado, size, peso) + anchoPuntos > anchoMaximo) {
    recortado = recortado.slice(0, -1)
  }
  return `${recortado.trimEnd()}...`
}
