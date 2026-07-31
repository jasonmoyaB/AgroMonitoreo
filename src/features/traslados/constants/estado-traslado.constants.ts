import type { EstadoTraslado } from '../types/traslado.types'

export const ESTADOS_TRASLADO: readonly EstadoTraslado[] = ['pendiente', 'aprobado', 'rechazado']

export const ETIQUETAS_ESTADO_TRASLADO: Record<EstadoTraslado, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
}
