import type { RegistroTrabajo, TipoLabor } from '../../types/domain.types'
import type { HorasPorLabor } from '../../types/kpis.types'

const UNIDAD_POR_DEFECTO = 'unidades'
const PORCENTAJE_TOTAL = 100

interface TotalesLabor {
  horas: number
  cantidad: number
}

// El ranking por cantidad no es comparable entre labores (cosecha da cajas, el resto
// tramos). Las horas si: son la misma unidad para todas, o sea la unica lectura honesta
// de en que se esta yendo la mano de obra. El rendimiento queda junto a su propia unidad.
export function calcularHorasPorLabor(registros: readonly RegistroTrabajo[], tiposLabor: readonly TipoLabor[]): HorasPorLabor[] {
  const totalesPorLabor = new Map<string, TotalesLabor>()

  for (const registro of registros) {
    const actual = totalesPorLabor.get(registro.tipoLaborId) ?? { horas: 0, cantidad: 0 }
    totalesPorLabor.set(registro.tipoLaborId, {
      horas: actual.horas + registro.horas,
      cantidad: actual.cantidad + (registro.cantidad ?? 0),
    })
  }

  const totalHoras = Array.from(totalesPorLabor.values()).reduce((suma, totales) => suma + totales.horas, 0)
  if (totalHoras <= 0) return []

  return tiposLabor
    .flatMap((tipoLabor) => construirFila(tipoLabor, totalesPorLabor.get(tipoLabor.id), totalHoras))
    .sort((a, b) => b.horas - a.horas)
}

function construirFila(tipoLabor: TipoLabor, totales: TotalesLabor | undefined, totalHoras: number): HorasPorLabor[] {
  if (!totales || totales.horas <= 0) return []

  return [
    {
      id: tipoLabor.id,
      nombre: tipoLabor.nombre,
      icono: tipoLabor.icono,
      color: tipoLabor.color,
      horas: totales.horas,
      porcentaje: (totales.horas / totalHoras) * PORCENTAJE_TOTAL,
      rendimiento: totales.cantidad / totales.horas,
      unidad: tipoLabor.unidadMedida ?? UNIDAD_POR_DEFECTO,
    },
  ]
}
