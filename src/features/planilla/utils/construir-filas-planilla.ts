import { calcularMontoQuincena } from '../../../shared/utils/calcular-monto-quincena'
import { calcularMontoSemanal } from '../../../shared/utils/calcular-monto-semanal'
import { calcularDeduccionAusencias } from './calcular-deduccion-ausencias'
import type { Finca, SalarioTrabajador } from '../../../shared/types/domain.types'
import type { AsistenciaConTrabajador } from '../../asistencia/types/asistencia.types'
import type { AusenciaEnQuincena, FilaPlanilla, PagoQuincenal } from '../types/planilla.types'

interface ConstruirFilasPlanillaInput {
  salarios: readonly SalarioTrabajador[]
  pagos: readonly PagoQuincenal[]
  // ya acotadas al rango de la quincena por listarAsistenciaPorRango
  ausencias: readonly AsistenciaConTrabajador[]
  finca: Pick<Finca, 'valorHora' | 'valorHoraUsd'>
}

// cruza el salario vigente con las ausencias de la quincena y con el pago ya registrado.
// montoNeto es lo que se pagaria hoy; pago.monto es lo que efectivamente se pago. la tabla
// muestra el segundo cuando existe, para que subir un salario no reescriba el pasado.
export function construirFilasPlanilla({ salarios, pagos, ausencias, finca }: ConstruirFilasPlanillaInput): FilaPlanilla[] {
  const pagoPorTrabajador = new Map(pagos.map((pago) => [pago.trabajadorId, pago]))
  const ausenciasPorTrabajador = agruparAusencias(ausencias)

  return salarios.map((salario) => {
    const montoQuincena = calcularMontoQuincena(salario.salarioMensual, salario.moneda)
    const ausenciasDelTrabajador = ausenciasPorTrabajador.get(salario.trabajadorId) ?? []
    const valorHora = salario.moneda === 'usd' ? finca.valorHoraUsd : finca.valorHora
    const deduccion = calcularDeduccionAusencias({ diasAusentes: ausenciasDelTrabajador.length, valorHora, moneda: salario.moneda })

    return {
      trabajadorId: salario.trabajadorId,
      nombreCompleto: salario.nombreCompleto,
      fotoUrl: salario.fotoUrl,
      salarioMensual: salario.salarioMensual,
      moneda: salario.moneda,
      montoSemanal: calcularMontoSemanal(salario.salarioMensual, salario.moneda),
      montoQuincena,
      ausencias: ausenciasDelTrabajador,
      // el clamp importa: mas ausencias que dias de quincena no pueden pagar en negativo
      montoNeto: Math.max(0, montoQuincena - deduccion),
      pago: pagoPorTrabajador.get(salario.trabajadorId) ?? null,
    }
  })
}

// sin dedup: asistencia tiene unique (trabajador_id, fecha), no hay doble conteo posible.
// el service ordena por fecha descendente; el modal las lee cronologicamente.
function agruparAusencias(ausencias: readonly AsistenciaConTrabajador[]): Map<string, AusenciaEnQuincena[]> {
  const porTrabajador = new Map<string, AusenciaEnQuincena[]>()
  ausencias.forEach(({ trabajadorId, fecha, tipo }) => porTrabajador.set(trabajadorId, [...(porTrabajador.get(trabajadorId) ?? []), { fecha, tipo }]))
  porTrabajador.forEach((lista) => lista.sort((una, otra) => una.fecha.localeCompare(otra.fecha)))
  return porTrabajador
}
