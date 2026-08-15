// los datos personales son string en el form (un input vacio es '', no null) y se
// normalizan a null en el service. fechaIngreso viaja como ISO yyyy-mm-dd.
// `asegurado` NO va aca: lo maneja solo la oficina desde /admin/trabajadores
// (cambiarAseguradoTrabajador). Si el form del supervisor lo mandara, cada guardado
// pisaria el valor que el admin acaba de poner.
export interface TrabajadorFormValues {
  nombreCompleto: string
  fotoUrl: string
  activo: boolean
  cedula: string
  fechaIngreso: string
  telefono: string
}

export interface CrearTrabajadorInput extends TrabajadorFormValues {
  fincaId: string
}

export interface ActualizarTrabajadorInput extends TrabajadorFormValues {
  id: string
}
