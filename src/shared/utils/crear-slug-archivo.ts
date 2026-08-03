import { quitarDiacriticos } from './quitar-diacriticos'

export function crearSlugArchivo(texto: string): string {
  return quitarDiacriticos(texto.toLowerCase())
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
