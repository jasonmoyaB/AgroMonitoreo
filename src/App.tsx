import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { queryClient } from './app/query-client'
import { useCachePersistente } from './shared/hooks/use-cache-persistente'
import { OfflineBanner } from './shared/components/OfflineBanner'
import { ToastViewport } from './shared/components/ToastViewport'
import { RegistrosPendientesBadge } from './features/captura/components/RegistrosPendientesBadge'

export function App() {
  // Nada se pinta hasta rehidratar: montar primero dispararia las queries contra la red y,
  // sin señal, la app arrancaria vacia justo cuando el cache guardado la salvaba.
  const rehidratado = useCachePersistente(queryClient)

  if (!rehidratado) return null

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineBanner />
      <RegistrosPendientesBadge />
      <ToastViewport />
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
