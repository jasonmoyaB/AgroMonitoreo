import type { RegistroTrabajo, TipoLabor } from '../../../shared/types/domain.types'
import type { MetricaPorLabor } from '../types/trabajador-metricas.types'

interface AcumuladoLabor {
  horas: number
  cantidad: number
}

export function calcularMetricasPorLabor(registros: readonly RegistroTrabajo[], tiposLabor: readonly TipoLabor[]): MetricaPorLabor[] {
  const acumuladoPorLabor = new Map<string, AcumuladoLabor>()

  for (const registro of registros) {
    const acumulado = acumuladoPorLabor.get(registro.tipoLaborId) ?? { horas: 0, cantidad: 0 }
    acumuladoPorLabor.set(registro.tipoLaborId, {
      horas: acumulado.horas + registro.horas,
      cantidad: acumulado.cantidad + (registro.cantidad ?? 0),
    })
  }

  return tiposLabor
    .map((tipoLabor) => crearMetrica(tipoLabor, acumuladoPorLabor.get(tipoLabor.id)))
    .filter((metrica) => metrica.horas > 0 || metrica.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)
}

function crearMetrica(tipoLabor: TipoLabor, acumulado: AcumuladoLabor | undefined): MetricaPorLabor {
  const horas = acumulado?.horas ?? 0
  const cantidad = acumulado?.cantidad ?? 0

  return {
    tipoLaborId: tipoLabor.id,
    nombre: tipoLabor.nombre,
    horas,
    cantidad,
    productividad: horas > 0 ? cantidad / horas : 0,
    unidadMedida: tipoLabor.unidadMedida,
  }
}
