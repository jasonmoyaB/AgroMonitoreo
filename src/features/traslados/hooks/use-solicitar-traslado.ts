import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useToastStore } from '../../../shared/stores/toast-store'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'
import { TRABAJADORES_OTRAS_FINCAS_QUERY_KEY, TRASLADOS_QUERY_KEY } from '../constants/traslados-query.constants'
import { listarMisTraslados, listarTrabajadoresOtrasFincas, solicitarTraslado } from '../services/traslados-service'
import { resumirResultados } from '../utils/resumir-resultados'

export function useSolicitarTraslado(fincaId: string | undefined) {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const [paso, setPaso] = useState<1 | 2>(1)
  const [fincaElegidaId, setFincaElegidaId] = useState<string | null>(null)
  const [fecha, setFecha] = useState(() => fechaLocalIso(1))
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
      // allSettled y no all: con Promise.all las solicitudes que si entraron quedaban
      // creadas pero sin invalidar la cache, y la UI decia que no habia pasado nada
      const resumen = resumirResultados(
        await Promise.allSettled(
          elegidos.map((trabajador) =>
            solicitarTraslado({ trabajadorId: trabajador.id, fincaOrigenId: fincaElegidaId, fincaDestinoId: fincaId, fecha })
          )
        )
      )

      await queryClient.invalidateQueries({ queryKey: [TRASLADOS_QUERY_KEY, fincaId] })
      setSeleccionados(new Set())
      setPaso(1)

      if (resumen.fallidos === 0) {
        mostrarToast({ type: 'success', title: 'Solicitud enviada', description: `Se pidió permiso para ${resumen.exitosos} trabajador(es) el ${fecha}.` })
        return
      }

      mostrarToast({
        type: 'error',
        title: resumen.exitosos === 0 ? 'No se pudo enviar la solicitud' : `Se enviaron ${resumen.exitosos} de ${elegidos.length}`,
        description: resumen.primerError ?? 'No se pudo enviar la solicitud.',
      })
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
