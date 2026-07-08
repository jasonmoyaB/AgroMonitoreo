import { TRABAJADORES_SEED } from '../../../shared/constants/trabajadores-seed.constants'
import type { Trabajador } from '../../../shared/types/domain.types'

export async function listarTrabajadoresPorFinca(fincaId: string): Promise<Trabajador[]> {
  return TRABAJADORES_SEED.filter((trabajador) => trabajador.fincaId === fincaId && trabajador.activo)
}
