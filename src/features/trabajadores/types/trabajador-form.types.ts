export interface TrabajadorFormValues {
  nombreCompleto: string
  fotoUrl: string
  activo: boolean
}

export interface CrearTrabajadorInput extends TrabajadorFormValues {
  fincaId: string
}
