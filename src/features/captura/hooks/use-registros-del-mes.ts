import { useQuery } from '@tanstack/react-query'
import { listarRegistrosDelMes } from '../services/registros-service'
import { REGISTROS_QUERY_KEY, REGISTROS_MES_QUERY_KEY } from '../constants/registros-query.constants'

const TODAS_LAS_FINCAS = 'todas'

// `fincaId` sin pasar = todas las fincas que deje ver la RLS, que es lo que necesita el
// rollup de oficina. `null` = todavia no hay finca elegida: no se consulta, en vez de traer
// todas y descartarlas en el cliente. Los dos casos van a claves distintas a proposito, para
// que la pantalla por finca no lea la cache del rollup mientras espera.
export function useRegistrosDelMes(anioMes: string, fincaId?: string | null) {
  return useQuery({
    queryKey: [REGISTROS_QUERY_KEY, REGISTROS_MES_QUERY_KEY, anioMes, fincaId === undefined ? TODAS_LAS_FINCAS : fincaId],
    queryFn: () => listarRegistrosDelMes(anioMes, fincaId ?? undefined),
    enabled: fincaId !== null,
  })
}
