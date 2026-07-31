import { calcularMontoQuincena } from '../../../shared/utils/calcular-monto-quincena'
import type { SalarioTrabajador } from '../../../shared/types/domain.types'
import type { FilaPlanilla, PagoQuincenal } from '../types/planilla.types'

// cruza el salario vigente con el pago ya registrado de esa quincena. montoQuincena es
// lo que se pagaria hoy; pago.monto es lo que efectivamente se pago. la tabla muestra
// el segundo cuando existe, para que subir un salario no reescriba el pasado.
export function construirFilasPlanilla(salarios: readonly SalarioTrabajador[], pagos: readonly PagoQuincenal[]): FilaPlanilla[] {
  const pagoPorTrabajador = new Map(pagos.map((pago) => [pago.trabajadorId, pago]))

  return salarios.map((salario) => ({
    trabajadorId: salario.trabajadorId,
    nombreCompleto: salario.nombreCompleto,
    fotoUrl: salario.fotoUrl,
    salarioMensual: salario.salarioMensual,
    moneda: salario.moneda,
    montoQuincena: calcularMontoQuincena(salario.salarioMensual, salario.moneda),
    pago: pagoPorTrabajador.get(salario.trabajadorId) ?? null,
  }))
}
