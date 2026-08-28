import { CircleCheckBig, CloudUpload } from 'lucide-react'
import type { EstadoConfirmacion } from '../types/estado-confirmacion.types'

interface ConfirmacionOverlayProps {
  estado: EstadoConfirmacion
}

// Dos estados y no uno: el check verde significa "el servidor lo tiene". Lo que quedo
// esperando señal se pinta ambar y con nube, sin texto — el capataz no lee.
export function ConfirmacionOverlay({ estado }: ConfirmacionOverlayProps) {
  const esPendiente = estado === 'pendiente'
  const Icono = esPendiente ? CloudUpload : CircleCheckBig
  const fondo = esPendiente ? 'bg-amber-500/90' : 'bg-emerald-600/90'
  const visibilidad = estado === 'oculto' ? 'pointer-events-none opacity-0' : 'opacity-100'

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${fondo} ${visibilidad}`}
      aria-hidden={estado === 'oculto'}
    >
      <Icono className="h-40 w-40 text-white" strokeWidth={3} aria-hidden="true" />
    </div>
  )
}
