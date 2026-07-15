import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { OfflineBanner } from './shared/components/OfflineBanner'
import { ToastViewport } from './shared/components/ToastViewport'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { throwOnError: true },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OfflineBanner />
      <ToastViewport />
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
