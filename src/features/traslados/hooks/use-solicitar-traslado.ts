import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useToastStore } from '../../../shared/stores/toast-store'
import { TRABAJADORES_OTRAS_FINCAS_QUERY_KEY, TRASLADOS_QUERY_KEY } from '../constants/traslados-query.constants'
import { listarMisTraslados, listarTrabajadoresOtrasFincas, solicitarTraslado } from '../services/traslados-service'

function obtenerFechaDeManana(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function useSolicitarTraslado(fincaId: string | undefined) {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const [paso, setPaso] = useState<1 | 2>(1)
  const [fincaElegidaId, setFincaElegidaId] = useState<string | null>(null)
  const [fecha, setFecha] = useState(obtenerFechaDeManana)
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: trabajadores = [], isLoading } = useQuery({
    queryKey: [TRABAJADORES_OTRAS_FINCAS_QUERY_KEY, fincaId],
    queryFn: () => listarTrabajadoresOtrasFincas(fincaId as string),
    enabled: !!fincaId,
  })

  const { data: misTraslados = [], isLoading: isLoadingMisTraslados } = useQuery({
    queryKey: [TRASLADOS_QUERY_KEY, fincaId],
    queryFn: () => listarMisTraslados(fincaId as string),
    enabled: !!fincaId,
  })

  const fincasDisponibles = Object.values(
    trabajadores.reduce<Record<string, { fincaId: string; fincaNombre: string; cantidad: number }>>((grupos, trabajador) => {
      const grupo = grupos[trabajador.fincaId] ?? { fincaId: trabajador.fincaId, fincaNombre: trabajador.fincaNombre, cantidad: 0 }
      grupo.cantidad += 1
      grupos[trabajador.fincaId] = grupo
      return grupos
    }, {})
  )

  const trabajadoresDeFincaElegida = trabajadores.filter((trabajador) => trabajador.fincaId === fincaElegidaId)

  function elegirFinca(id: string) {
    setFincaElegidaId(id)
    setSeleccionados(new Set())
    setPaso(2)
  }

  function volverAFincas() {
    setPaso(1)
  }

  function alternarSeleccion(trabajadorId: string) {
    setSeleccionados((actual) => {
      const siguiente = new Set(actual)
      if (siguiente.has(trabajadorId)) siguiente.delete(trabajadorId)
      else siguiente.add(trabajadorId)
      return siguiente
    })
  }

  async function enviarSolicitud() {
    if (!fincaId || !fincaElegidaId || seleccionados.size === 0) return

    setIsSubmitting(true)
    try {
      const elegidos = trabajadoresDeFincaElegida.filter((trabajador) => seleccionados.has(trabajador.id))
      await Promise.all(
        elegidos.map((trabajador) =>
          solicitarTraslado({ trabajadorId: trabajador.id, fincaOrigenId: fincaElegidaId, fincaDestinoId: fincaId, fecha })
        )
      )
      await queryClient.invalidateQueries({ queryKey: [TRASLADOS_QUERY_KEY, fincaId] })
      setSeleccionados(new Set())
      setPaso(1)
      mostrarToast({ type: 'success', title: 'Solicitud enviada', description: `Se pidió permiso para ${elegidos.length} trabajador(es) el ${fecha}.` })
    } catch (unknownError) {
      const description = unknownError instanceof Error ? unknownError.message : 'No se pudo enviar la solicitud.'
      mostrarToast({ type: 'error', title: 'No se pudo enviar la solicitud', description })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    paso,
    fincasDisponibles,
    isLoading,
    fincaElegida: fincasDisponibles.find((finca) => finca.fincaId === fincaElegidaId) ?? null,
    trabajadoresDeFincaElegida,
    misTraslados,
    isLoadingMisTraslados,
    fecha,
    seleccionados,
    isSubmitting,
    setFecha,
    elegirFinca,
    volverAFincas,
    alternarSeleccion,
    enviarSolicitud,
  }
}
