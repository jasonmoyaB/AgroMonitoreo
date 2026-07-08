export interface MesOpcion {
  valor: number
  abreviatura: string
  nombre: string
}

export const MESES: readonly MesOpcion[] = [
  { valor: 1, abreviatura: 'Ene', nombre: 'Enero' },
  { valor: 2, abreviatura: 'Feb', nombre: 'Febrero' },
  { valor: 3, abreviatura: 'Mar', nombre: 'Marzo' },
  { valor: 4, abreviatura: 'Abr', nombre: 'Abril' },
  { valor: 5, abreviatura: 'May', nombre: 'Mayo' },
  { valor: 6, abreviatura: 'Jun', nombre: 'Junio' },
  { valor: 7, abreviatura: 'Jul', nombre: 'Julio' },
  { valor: 8, abreviatura: 'Ago', nombre: 'Agosto' },
  { valor: 9, abreviatura: 'Sep', nombre: 'Septiembre' },
  { valor: 10, abreviatura: 'Oct', nombre: 'Octubre' },
  { valor: 11, abreviatura: 'Nov', nombre: 'Noviembre' },
  { valor: 12, abreviatura: 'Dic', nombre: 'Diciembre' },
]
