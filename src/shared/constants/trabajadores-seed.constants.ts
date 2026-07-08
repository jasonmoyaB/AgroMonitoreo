import type { Trabajador } from '../types/domain.types'
import { FINCA_ACTUAL } from './finca.constants'

const NOMBRES_SEED = [
  'Juan Pérez',
  'María Gómez',
  'Carlos Rojas',
  'Ana Vargas',
  'Luis Castro',
  'Sofía Méndez',
  'Pedro Alvarado',
  'Rosa Jiménez',
]

export const TRABAJADORES_SEED: readonly Trabajador[] = NOMBRES_SEED.map((nombre, index) => ({
  id: `trabajador-${index + 1}`,
  fincaId: FINCA_ACTUAL.id,
  nombreCompleto: nombre,
  fotoUrl: null,
  activo: true,
}))
