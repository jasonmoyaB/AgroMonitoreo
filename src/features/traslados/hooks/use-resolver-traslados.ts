import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useToastStore } from '../../../shared/stores/toast-store'
import { TRASLADOS_QUERY_KEY } from '../constants/traslados-query.constants'
import { listarTrasladosPendientes, resolverTraslado } from '../services/traslados-service'
import type { EstadoTraslado } from '../types/traslado.types'

const QUERY_KEY = [TRASLADOS_QUERY_KEY, 'pendientes']

export function useResolverTraslados() {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const [resolviendoId, setResolviendoId] = useState<string | null>(null)

  const { data: pendientes = [], isLoading } = useQuery({ queryKey: QUERY_KEY, queryFn: () => listarTrasladosPendientes() })

  async function resolver(id: string, estado: Extract<EstadoTraslado, 'aprobado' | 'rechazado'>) {
    setResolviendoId(id)
    try {
      await resolverTraslado(id, estado)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      mostrarToast({ type: 'success', title: estado === 'aprobado' ? 'Traslado aprobado' : 'Traslado rechazado' })
    } catch (unknownError) {
      const description = unknownError instanceof Error ? unknownError.message : 'No se pudo resolver la solicitud.'
      mostrarToast({ type: 'error', title: 'No se pudo resolver la solicitud', description })
    } finally {
      setResolviendoId(null)
    }
  }

  return { pendientes, isLoading, resolviendoId, aprobar: (id: string) => resolver(id, 'aprobado'), rechazar: (id: string) => resolver(id, 'rechazado') }
}
