import { useQuery } from '@tanstack/react-query'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { TRABAJADORES_QUERY_KEY } from '../constants/trabajadores-query.constants'
import { listarTodosTrabajadoresPorFinca } from '../services/trabajadores-service'

const QUERY_KEY = [TRABAJADORES_QUERY_KEY, FINCA_ACTUAL.id]

export function useTrabajadoresListado() {
  const { data: trabajadores = [], isLoading } = useQuery({ queryKey: QUERY_KEY, queryFn: () => listarTodosTrabajadoresPorFinca(FINCA_ACTUAL.id) })

  return { trabajadores, isLoading, finca: FINCA_ACTUAL }
}
