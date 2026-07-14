import type { RegistroTrabajo } from '../../../shared/types/domain.types'
import type { TrabajadorMetricasTotales } from '../types/trabajador-metricas.types'
import { calcularExtraPorRegistro } from './calcular-extra-por-registro'

export function calcularTotalesMetricas(registros: readonly RegistroTrabajo[]): TrabajadorMetricasTotales {
  const horas = registros.reduce((suma, registro) => suma + registro.horas, 0)
  const cantidad = registros.reduce((suma, registro) => suma + (registro.cantidad ?? 0), 0)
  const horasExtra = sumar(calcularExtraPorRegistro(registros), (extra) => extra.horasExtra)

  return { horas, cantidad, productividad: horas > 0 ? cantidad / horas : 0, horasExtra }
}

function sumar<T>(mapa: ReadonlyMap<string, T>, obtenerValor: (valor: T) => number): number {
  return Array.from(mapa.values()).reduce((suma, valor) => suma + obtenerValor(valor), 0)
}
