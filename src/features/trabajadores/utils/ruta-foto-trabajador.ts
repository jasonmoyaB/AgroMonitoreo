import { BUCKET_FOTOS_TRABAJADORES } from '../constants/foto-trabajador.constants'

const SEPARADOR_PUBLICO = `/${BUCKET_FOTOS_TRABAJADORES}/`

// Devuelve la ruta dentro del bucket (`<finca>/<uuid>.<ext>`) a partir de lo guardado en
// trabajadores.foto_url.
//
// Acepta las dos formas a proposito. Mientras el bucket fue publico se guardaba la URL
// completa; desde que es privado se guarda la ruta pelada, porque una URL firmada vence y
// escribirla en la base la dejaria rota al dia siguiente. Las filas viejas siguen teniendo
// la URL entera y no se migran: normalizarlas aca cuesta menos que un update masivo sobre
// produccion, y el dia que no quede ninguna esta funcion se simplifica sola.
export function rutaDesdeFotoUrl(fotoUrl: string | null): string | null {
  if (fotoUrl === null) return null

  const valor = fotoUrl.trim()
  if (valor === '') return null

  const corte = valor.indexOf(SEPARADOR_PUBLICO)
  if (corte === -1) return valor

  // Puede venir con querystring (`?token=...`) de una URL firmada vieja.
  const ruta = valor.slice(corte + SEPARADOR_PUBLICO.length)
  return ruta.split('?')[0] || null
}
