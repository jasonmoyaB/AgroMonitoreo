import { CloudUpload } from 'lucide-react'
import { useRegistrosPendientes } from '../hooks/use-registros-pendientes'

export function RegistrosPendientesBadge() {
  const pendientes = useRegistrosPendientes()

  if (pendientes === 0) return null

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-3 text-lg font-black text-white shadow-lg"
    >
      <CloudUpload className="h-6 w-6 shrink-0" aria-hidden="true" />
      {pendientes}
      <span className="sr-only">registros esperando conexión</span>
    </div>
  )
}
