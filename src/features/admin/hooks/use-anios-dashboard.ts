import { useAnioPrimerRegistro } from '../../captura/hooks/use-anio-primer-registro'
import { obtenerAniosDashboard } from '../utils/obtener-anios-dashboard'

export function useAniosDashboard(): number[] {
  const { data: anioPrimerRegistro } = useAnioPrimerRegistro()
  return obtenerAniosDashboard(anioPrimerRegistro ?? null)
}
