import type { RegistroTrabajo, TipoLabor, Trabajador } from '../../types/domain.types'
import type { DashboardUnidad } from '../../types/kpis.types'
import { calcularRankingLabores } from './calcular-ranking-labores'
import { calcularRankingTrabajadores } from './calcular-ranking-trabajadores'
import { calcularTendenciaDiaria } from './calcular-tendencia-diaria'
import { construirProduccionDiaria } from './construir-produccion-diaria'

interface ConstruirDashboardPorUnidadInput {
  periodo: string
  registros: readonly RegistroTrabajo[]
  trabajadores: readonly Trabajador[]
  tiposLabor: readonly TipoLabor[]
}

// Un bloque por unidad de medida en vez de un total mezclado: sumar cajas de cosecha con
// tramos de amarre da un numero que no se puede rotular ni comparar, y era justo lo que el
// dashboard mostraba como "unidades".
export function construirDashboardPorUnidad({ periodo, registros, trabajadores, tiposLabor }: ConstruirDashboardPorUnidadInput): DashboardUnidad[] {
  return agruparPorUnidad(registros, tiposLabor).map(([unidad, registrosDeLaUnidad]) => {
    const tendenciaDiaria = calcularTendenciaDiaria(registrosDeLaUnidad)
    return {
      unidad,
      tendenciaDiaria,
      produccionDiaria: construirProduccionDiaria(periodo, tendenciaDiaria),
      rankingLabores: calcularRankingLabores(registrosDeLaUnidad, tiposLabor),
      rankingTrabajadores: calcularRankingTrabajadores(registrosDeLaUnidad, trabajadores),
    }
  })
}

// El orden lo fija tiposLabor, no el orden en que llegaron los registros: si no, los
// bloques del dashboard se reordenan segun quien cargo primero ese mes.
// Un registro cuya labor no esta en tiposLabor (o no tiene unidad) se descarta a proposito:
// sin unidad no hay bloque al que sumarlo. Es el mismo criterio que ya aplican
// calcular-cantidades-por-unidad.ts y el denominador de calcular-horas-por-labor.ts, asi que
// las tarjetas de KPI y los graficos cuentan lo mismo. El riesgo real es que
// tipos-labor.constants.ts se desincronice de la tabla `labores` (errores-conocidos.md):
// esa produccion desaparece del dashboard entero, no solo de un grafico.
function agruparPorUnidad(registros: readonly RegistroTrabajo[], tiposLabor: readonly TipoLabor[]): [string, RegistroTrabajo[]][] {
  const unidadPorLabor = new Map(tiposLabor.map((tipoLabor) => [tipoLabor.id, tipoLabor.unidadMedida]))
  const porUnidad = new Map<string, RegistroTrabajo[]>()

  for (const registro of registros) {
    const unidad = unidadPorLabor.get(registro.tipoLaborId)
    if (!unidad) continue
    const acumulados = porUnidad.get(unidad)
    if (acumulados === undefined) porUnidad.set(unidad, [registro])
    else acumulados.push(registro)
  }

  const ordenadas = new Set(tiposLabor.flatMap((tipoLabor) => (tipoLabor.unidadMedida === null ? [] : [tipoLabor.unidadMedida])))
  return [...ordenadas].flatMap((unidad) => {
    const registrosDeLaUnidad = porUnidad.get(unidad)
    return registrosDeLaUnidad === undefined ? [] : [[unidad, registrosDeLaUnidad] as [string, RegistroTrabajo[]]]
  })
}
