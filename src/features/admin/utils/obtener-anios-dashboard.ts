import { descomponerFechaIso } from '../../../shared/utils/fecha-iso'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'

// El anio en curso siempre esta, aunque todavia no haya registros: sin el el selector
// quedaria vacio. Al cambiar de anio entra solo, sin tocar codigo.
export function obtenerAniosDashboard(anioPrimerRegistro: number | null): number[] {
  const anioActual = descomponerFechaIso(fechaLocalIso()).anio
  const anioMasViejo = Math.min(anioPrimerRegistro ?? anioActual, anioActual)
  return Array.from({ length: anioActual - anioMasViejo + 1 }, (_, indice) => anioActual - indice)
}
