import { WifiOff } from 'lucide-react'
import { useNetworkStatus } from '../hooks/use-network-status'

export function OfflineBanner() {
  const enLinea = useNetworkStatus()

  if (enLinea) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      Sin conexión a internet. Lo que estés completando se guarda en este dispositivo mientras reconectas.
    </div>
  )
}
