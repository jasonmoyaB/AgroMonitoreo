import { useMutationState } from '@tanstack/react-query'
import { CREAR_REGISTRO_MUTATION_KEY } from '../constants/registros-query.constants'

// Cuenta los registros que todavia no llegaron al servidor: los pausados por falta de señal
// y los que estan reintentando. Filtra por la clave de mutacion para no contar de paso las
// escrituras de otras pantallas (salarios, asistencia).
export function useRegistrosPendientes(): number {
  return useMutationState({
    filters: { mutationKey: CREAR_REGISTRO_MUTATION_KEY, status: 'pending' },
    select: (mutation) => mutation.mutationId,
  }).length
}
