import type { TipoLabor } from '../../../shared/types/domain.types'
import type { LaborTask } from '../types/supervisor-dashboard.types'

const AMARRE_CODIGO_PREFIX = 'amarre_'
const AMARRE_NOMBRE_PREFIX = 'Amarre '
const AMARRE_TASK_ID = 'amarre'
const AMARRE_TASK_NOMBRE = 'Amarre'

export function crearTareasLabor(tiposLabor: readonly TipoLabor[]): LaborTask[] {
  const opcionesAmarre = tiposLabor.filter(esOpcionAmarre).map(crearOpcionAmarre)
  let amarreAgregado = false

  return tiposLabor.flatMap((tipoLabor) => {
    if (!esOpcionAmarre(tipoLabor)) {
      return [{ id: tipoLabor.id, tipoLabor, opciones: [{ tipoLabor, etiqueta: tipoLabor.nombre }] }]
    }

    if (amarreAgregado) {
      return []
    }

    amarreAgregado = true
    return [{ id: AMARRE_TASK_ID, tipoLabor: crearTareaAmarre(tipoLabor), opciones: opcionesAmarre }]
  })
}

function esOpcionAmarre(tipoLabor: TipoLabor) {
  return tipoLabor.codigo.startsWith(AMARRE_CODIGO_PREFIX)
}

function crearTareaAmarre(tipoLabor: TipoLabor): TipoLabor {
  return { ...tipoLabor, id: AMARRE_TASK_ID, codigo: AMARRE_TASK_ID, nombre: AMARRE_TASK_NOMBRE }
}

function crearOpcionAmarre(tipoLabor: TipoLabor) {
  return { tipoLabor, etiqueta: tipoLabor.nombre.replace(AMARRE_NOMBRE_PREFIX, '') }
}
