import type { Moneda } from '../../../shared/types/domain.types'

export interface CrearFincaInput {
  id: string
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
