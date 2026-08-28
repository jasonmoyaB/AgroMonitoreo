import { QueryClient } from '@tanstack/react-query'
import { esClavePersistible } from './claves-persistibles'
import { crearRegistro } from '../features/captura/services/registros-service'
import { CREAR_REGISTRO_MUTATION_KEY, REGISTROS_QUERY_KEY } from '../features/captura/constants/registros-query.constants'
import type { RegistroTrabajo } from '../shared/types/domain.types'

const INTENTOS_REINTENTO = 3
// Tiene que ser >= la vigencia de persistencia-query.ts: con el default de 5 min, lo que se
// rehidrata se recolecta apenas monta y persistir el cache no sirve de nada.
const TIEMPO_EN_CACHE_MS = 7 * 24 * 60 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { throwOnError: true, gcTime: TIEMPO_EN_CACHE_MS },
    // Sin este filtro `dehydrate` persiste toda query en `success`, o sea tambien la planilla
    // y los datos personales. Ver claves-persistibles.ts.
    dehydrate: {
      shouldDehydrateQuery: (query) => query.state.status === 'success' && esClavePersistible(query.queryKey),
    },
  },
})

// El `mutationFn` va aca y no en el hook a proposito: una mutacion pausada que sobrevive a
// un reload se rehidrata sin funcion, y sin este default no habria que reanudar. Las
// callbacks de UI (sonido, overlay) quedan en el hook, que solo corre con la pantalla montada.
queryClient.setMutationDefaults(CREAR_REGISTRO_MUTATION_KEY, {
  mutationFn: (registro: RegistroTrabajo) => crearRegistro(registro),
  retry: INTENTOS_REINTENTO,
  onSettled: () => queryClient.invalidateQueries({ queryKey: [REGISTROS_QUERY_KEY] }),
})
