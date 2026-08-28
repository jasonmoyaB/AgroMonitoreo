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

    restaurarCacheQuery().then((estado) => {
      if (cancelado) return
      if (estado !== null) hydrate(queryClient, estado)
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
    const guardarConDemora = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => void guardarCacheQuery(dehydrate(queryClient)), DEMORA_GUARDADO_MS)
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
