const SEPARADOR_SUFIJO_CANTIDAD = ':'
const SIN_APARICIONES = 0

/**
 * El body del rango de HaveIBeenPwned son lineas `SUFIJO:CANTIDAD` separadas por CRLF.
 * Devuelve cuantas veces aparecio esa contrasena en filtraciones, 0 si el sufijo no esta.
 */
export function contarAparicionesPwned(cuerpo: string, sufijo: string): number {
  const buscado = sufijo.trim().toUpperCase()
  if (!buscado) return SIN_APARICIONES

  for (const linea of cuerpo.split('\n')) {
    const [sufijoLinea, cantidad] = linea.trim().split(SEPARADOR_SUFIJO_CANTIDAD)
    if (sufijoLinea?.toUpperCase() !== buscado) continue

    const apariciones = Number(cantidad)
    return Number.isFinite(apariciones) ? apariciones : SIN_APARICIONES
  }

  return SIN_APARICIONES
}
