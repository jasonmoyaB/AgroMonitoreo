import { useQuery } from '@tanstack/react-query'
import { listarTodosRegistros } from '../services/registros-service'

export function useTodosRegistros() {
  return useQuery({ queryKey: ['registros', 'todos'], queryFn: listarTodosRegistros })
}
