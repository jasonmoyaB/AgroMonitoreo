import { ETIQUETAS_ESTADO_TRASLADO } from '../constants/estado-traslado.constants'
import type { EstadoTraslado } from '../types/traslado.types'

const ESTILOS: Record<EstadoTraslado, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
}

export function TrasladoEstadoBadge({ estado }: { estado: EstadoTraslado }) {
  return (
    <span className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black uppercase tracking-wide ${ESTILOS[estado]}`}>
      {ETIQUETAS_ESTADO_TRASLADO[estado]}
    </span>
  )
}
