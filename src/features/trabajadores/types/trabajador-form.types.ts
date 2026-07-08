export interface TrabajadorFormValues {
  nombreCompleto: string
  fotoUrl: string
  activo: boolean
}

export interface CrearTrabajadorInput extends TrabajadorFormValues {
  fincaId: string
}

export interface ActualizarTrabajadorInput extends TrabajadorFormValues {
  id: string
}
