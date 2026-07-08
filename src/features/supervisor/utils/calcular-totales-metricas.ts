import type { RegistroTrabajo } from '../../../shared/types/domain.types'
import type { TrabajadorMetricasTotales } from '../types/trabajador-metricas.types'

export function calcularTotalesMetricas(registros: readonly RegistroTrabajo[]): TrabajadorMetricasTotales {
  const horas = registros.reduce((suma, registro) => suma + registro.horas, 0)
  const cantidad = registros.reduce((suma, registro) => suma + (registro.cantidad ?? 0), 0)

  return { horas, cantidad, productividad: horas > 0 ? cantidad / horas : 0 }
}
