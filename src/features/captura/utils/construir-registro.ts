import type { RegistroTrabajo, TipoLabor } from '../../../shared/types/domain.types'
import { crearIdRegistro } from './crear-id-registro'
import { REGISTRADO_POR_LOCAL } from '../constants/captura.constants'

interface ConstruirRegistroParams {
  fincaId: string
  trabajadorId: string
  tipoLabor: TipoLabor
  fecha: string
  horas: number
  cantidad: number
}

export function construirRegistro(params: ConstruirRegistroParams): RegistroTrabajo {
  return {
    id: crearIdRegistro(),
    fincaId: params.fincaId,
    trabajadorId: params.trabajadorId,
    tipoLaborId: params.tipoLabor.id,
    fecha: params.fecha,
    horas: params.horas,
    cantidad: params.tipoLabor.tieneCantidad ? params.cantidad : null,
    registradoPor: REGISTRADO_POR_LOCAL,
    createdAt: new Date().toISOString(),
  }
}
