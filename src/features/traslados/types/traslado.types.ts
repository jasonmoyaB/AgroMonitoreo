import type { Trabajador } from '../../../shared/types/domain.types'

export type EstadoTraslado = 'pendiente' | 'aprobado' | 'rechazado'

export interface Traslado {
  id: string
  trabajadorId: string
  trabajadorNombre: string
  fincaOrigenId: string
  fincaOrigenNombre: string
  fincaDestinoId: string
  fincaDestinoNombre: string
  fecha: string
  estado: EstadoTraslado
}

export interface TrabajadorOtraFinca {
  id: string
  nombreCompleto: string
  fincaId: string
  fincaNombre: string
}

export interface TrabajadorPrestado extends Trabajador {
  fincaOrigenNombre: string
}

export interface SolicitarTrasladoInput {
  trabajadorId: string
  fincaOrigenId: string
  fincaDestinoId: string
  fecha: string
}
