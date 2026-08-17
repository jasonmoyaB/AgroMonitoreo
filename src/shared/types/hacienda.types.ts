/**
 * Lo que devuelve api.hacienda.go.cr/fe/ae, ya mapeado al dominio.
 *
 * Ojo con lo que NO trae: fecha de nacimiento, direccion, telefono ni correo.
 * Hacienda es el registro tributario, no el civil. El unico dato personal que
 * da es el nombre; todo lo demas es situacion fiscal.
 */
export interface ContribuyenteHacienda {
  nombre: string
  regimen: string
  estado: string
  moroso: boolean
  omiso: boolean
}
