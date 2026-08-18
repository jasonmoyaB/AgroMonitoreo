// Todos los campos son string y no `string | null` a proposito: esta es la forma
// que consume el form, y un input nunca tiene valor null. El mapeo '' <-> null
// contra la base vive en perfil-service.ts, que es el unico que conoce la fila.
export interface DatosPersonalesUsuario {
  telefono: string
  emailContacto: string
  cedula: string
  fechaNacimiento: string
  direccion: string
  contactoEmergencia: string
}
