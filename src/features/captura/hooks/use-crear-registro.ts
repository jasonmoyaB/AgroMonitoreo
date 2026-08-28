import { useMutation, useQueryClient } from '@tanstack/react-query'
import { playConfirmSound } from '../../../shared/lib/play-sound'
import { CREAR_REGISTRO_MUTATION_KEY, claveRegistrosDelDia } from '../constants/registros-query.constants'
import { insertarRegistroEnCache } from '../utils/insertar-registro-en-cache'
import type { RegistroTrabajo } from '../../../shared/types/domain.types'

interface ContextoOptimista {
  clave: readonly unknown[]
  previos: RegistroTrabajo[] | undefined
}

// El `mutationFn`, el retry y la invalidacion viven en los defaults del cliente
// (src/app/query-client.ts) para que un registro cargado sin señal se pueda reanudar despues
// de un reload. Aca queda solo lo que necesita la pantalla montada.
export function useCrearRegistro() {
  const queryClient = useQueryClient()

  return useMutation<RegistroTrabajo, Error, RegistroTrabajo, ContextoOptimista>({
    mutationKey: CREAR_REGISTRO_MUTATION_KEY,
    // Sin la escritura optimista, sin red la grid no pinta el check verde de "ya cargado hoy"
    // y el capataz vuelve a cargar al mismo trabajador. El upsert lo perdona, la UX no.
    onMutate: async (registro) => {
      const clave = claveRegistrosDelDia(registro.fecha)
      await queryClient.cancelQueries({ queryKey: clave })
      const previos = queryClient.getQueryData<RegistroTrabajo[]>(clave)
      queryClient.setQueryData<RegistroTrabajo[]>(clave, (actuales) => insertarRegistroEnCache(actuales ?? [], registro))
      return { clave, previos }
    },
    onError: (_error, _registro, contexto) => {
      if (contexto !== undefined) queryClient.setQueryData(contexto.clave, contexto.previos)
    },
    onSuccess: () => playConfirmSound(),
  })
}
