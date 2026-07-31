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

export type EstadoFiltroTraslado = EstadoTraslado | 'todos'

export type SentidoFiltroTraslado = 'todos' | 'recibido' | 'prestado'

export interface TrasladosFiltros {
  trabajador: string
  estado: EstadoFiltroTraslado
  /** nombre de finca (origen o destino); '' = todas */
  finca: string
  sentido: SentidoFiltroTraslado
  /** ISO yyyy-mm-dd; '' = sin limite */
  desde: string
  hasta: string
}

export interface SolicitarTrasladoInput {
  trabajadorId: string
  fincaOrigenId: string
  fincaDestinoId: string
  fecha: string
}
