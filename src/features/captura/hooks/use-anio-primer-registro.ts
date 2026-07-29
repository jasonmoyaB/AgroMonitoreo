import { useQuery } from '@tanstack/react-query'
import { obtenerAnioPrimerRegistro } from '../services/registros-service'
import { REGISTROS_QUERY_KEY, REGISTROS_PRIMER_ANIO_QUERY_KEY } from '../constants/registros-query.constants'

export function useAnioPrimerRegistro() {
  return useQuery({
    queryKey: [REGISTROS_QUERY_KEY, REGISTROS_PRIMER_ANIO_QUERY_KEY],
    queryFn: () => obtenerAnioPrimerRegistro(),
  })
}
