import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { ToastViewport } from './shared/components/ToastViewport'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastViewport />
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
