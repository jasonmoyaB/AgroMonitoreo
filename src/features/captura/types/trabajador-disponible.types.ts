export interface TrabajadorDisponible {
  id: string
  fincaId: string
  nombreCompleto: string
  fotoUrl: string | null
  activo: boolean
  fincaOrigenNombre: string | null
}
