import type { RegistroTrabajo, TipoLabor } from '../../../shared/types/domain.types'
import type { MetricaPorLabor } from '../types/trabajador-metricas.types'
import { calcularExtraPorRegistro } from './calcular-extra-por-registro'

interface AcumuladoLabor {
  horas: number
  horasExtra: number
  cantidad: number
  cantidadExtra: number
}

export function calcularMetricasPorLabor(registros: readonly RegistroTrabajo[], tiposLabor: readonly TipoLabor[]): MetricaPorLabor[] {
  const extraPorId = calcularExtraPorRegistro(registros)
  const acumuladoPorLabor = new Map<string, AcumuladoLabor>()

  for (const registro of registros) {
    const acumulado = acumuladoPorLabor.get(registro.tipoLaborId) ?? { horas: 0, horasExtra: 0, cantidad: 0, cantidadExtra: 0 }
    const extra = extraPorId.get(registro.id)
    acumuladoPorLabor.set(registro.tipoLaborId, {
      horas: acumulado.horas + registro.horas,
      horasExtra: acumulado.horasExtra + (extra?.horasExtra ?? 0),
      cantidad: acumulado.cantidad + (registro.cantidad ?? 0),
      cantidadExtra: acumulado.cantidadExtra + (extra?.cantidadExtra ?? 0),
    })
  }

  return tiposLabor
    .flatMap((tipoLabor) => {
      const metrica = crearMetrica(tipoLabor, acumuladoPorLabor.get(tipoLabor.id))
      return metrica.horas > 0 || metrica.cantidad > 0 ? [metrica] : []
    })
    .sort((a, b) => b.cantidad - a.cantidad)
}

function crearMetrica(tipoLabor: TipoLabor, acumulado: AcumuladoLabor | undefined): MetricaPorLabor {
  const horas = acumulado?.horas ?? 0
  const cantidad = acumulado?.cantidad ?? 0

  return {
    tipoLaborId: tipoLabor.id,
    nombre: tipoLabor.nombre,
    horas,
    horasExtra: acumulado?.horasExtra ?? 0,
    cantidad,
    cantidadExtra: acumulado?.cantidadExtra ?? 0,
    productividad: horas > 0 ? cantidad / horas : 0,
    unidadMedida: tipoLabor.unidadMedida,
  }
}
