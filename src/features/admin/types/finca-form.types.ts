import type { Moneda } from '../../../shared/types/domain.types'

// Sin `id`: lo arma la base con el prefijo de la organizacion (trigger generar_id_finca).
// Mientras lo tipeaba el admin, dos clientes no podian tener una finca con el mismo slug y
// el error de duplicado le confirmaba al segundo que el primero existe.
export interface CrearFincaInput {
  nombre: string
}

export interface ActualizarFincaInput {
  id: string
  nombre: string
}

export interface ActualizarValorHoraInput {
  id: string
  valorHora: number
  moneda: Moneda
}
