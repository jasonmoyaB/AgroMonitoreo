export interface AsistenciaConTrabajador {
  id: string
  fecha: string
  trabajadorId: string
  trabajadorNombre: string
}

export interface RangoSemana {
  inicio: string
  fin: string
  etiqueta: string
}
