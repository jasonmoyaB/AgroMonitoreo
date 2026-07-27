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

export interface TrabajadorPrestado {
  id: string
  fincaId: string
  nombreCompleto: string
  fotoUrl: string | null
  activo: boolean
  fincaOrigenNombre: string
}

export interface TrabajadorTrasladadoHoy {
  trabajadorId: string
  fincaDestinoNombre: string
}

export interface SolicitarTrasladoInput {
  trabajadorId: string
  fincaOrigenId: string
  fincaDestinoId: string
  fecha: string
}
