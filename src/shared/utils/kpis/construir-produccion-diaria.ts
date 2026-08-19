import { construirFechaIso, descomponerFechaIso } from '../fecha-iso'
import { obtenerDiasEnMes } from '../obtener-dias-en-mes'
import type { DiaProduccion, ProduccionDiaria, TendenciaPunto } from '../../types/kpis.types'

// Expande la tendencia (solo los dias que tienen registro) al mes calendario completo.
// El promedio se divide entre los dias con registro y no entre los 30 del mes: dividir
// entre 30 en un mes a medias da un promedio falso que nadie puede usar para comparar.
export function construirProduccionDiaria(periodo: string, puntos: readonly TendenciaPunto[]): ProduccionDiaria {
  const { anio, mes } = descomponerFechaIso(periodo)
  const valorPorFecha = new Map(puntos.map((punto) => [punto.fecha, punto.valor]))

  const dias = Array.from({ length: obtenerDiasEnMes(anio, mes) }, (_vacio, indice) => {
    const fecha = construirFechaIso({ anio, mes, dia: indice + 1 })
    return { dia: indice + 1, fecha, valor: valorPorFecha.get(fecha) ?? 0 }
  })

  const conRegistro = dias.filter((dia) => dia.valor > 0)
  const total = conRegistro.reduce((suma, dia) => suma + dia.valor, 0)

  return {
    dias,
    total,
    maximo: conRegistro.reduce((mayor, dia) => Math.max(mayor, dia.valor), 0),
    promedio: conRegistro.length > 0 ? total / conRegistro.length : 0,
    diasConRegistro: conRegistro.length,
    mejorDia: conRegistro.reduce<DiaProduccion | null>((mejor, dia) => (mejor !== null && mejor.valor >= dia.valor ? mejor : dia), null),
  }
}
