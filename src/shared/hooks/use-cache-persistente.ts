import { useEffect, useState } from 'react'
import { dehydrate, hydrate, type QueryClient } from '@tanstack/react-query'
import { guardarCacheQuery, restaurarCacheQuery } from '../lib/persistencia-query'

const DEMORA_GUARDADO_MS = 1000

// Rehidrata el cache antes del primer render de la app y lo vuelve a guardar cada vez que
// cambia. Sin esto, sin red no hay lista de trabajadores ni labores y la pantalla de captura
// no se pinta: encolar la escritura no alcanza, tambien hay que sobrevivir a las lecturas.
// `dehydrate` incluye por default las mutaciones pausadas, que es como un registro cargado
// sin señal sobrevive a un reload; `resumePausedMutations` las reenvia al volver la conexion.
export function useCachePersistente(queryClient: QueryClient): boolean {
  const [rehidratado, setRehidratado] = useState(false)

  useEffect(() => {
    let cancelado = false

    restaurarCacheQuery()
      .then((estado) => {
        if (!cancelado && estado !== null) hydrate(queryClient, estado)
      })
      // Arrancar sin cache es recuperable; no arrancar no lo es. Si IndexedDB no esta
      // disponible (navegacion privada, storage bloqueado) o lo guardado no se puede
      // deserializar, la app tiene que montar igual: `App` no pinta nada hasta que esto
      // resuelva, y el errorElement del router no ayuda porque el router ni llega a montarse.
      .catch(() => {})
      .finally(() => {
        if (cancelado) return
        setRehidratado(true)
        void queryClient.resumePausedMutations()
      })

    return () => {
      cancelado = true
    }
  }, [queryClient])

  useEffect(() => {
    if (!rehidratado) return

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    // Un fallo al guardar (tipico: QuotaExceededError) no puede romper la pantalla, pero
    // tampoco puede pasar callado: si se traga, la app cree que persiste y no persiste.
    const guardarConDemora = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        guardarCacheQuery(dehydrate(queryClient)).catch((error: unknown) => console.error('guardarCacheQuery', error))
      }, DEMORA_GUARDADO_MS)
    }
    const desuscribirQueries = queryClient.getQueryCache().subscribe(guardarConDemora)
    const desuscribirMutaciones = queryClient.getMutationCache().subscribe(guardarConDemora)

    return () => {
      clearTimeout(timeoutId)
      desuscribirQueries()
      desuscribirMutaciones()
    }
  }, [queryClient, rehidratado])

  return rehidratado
}
