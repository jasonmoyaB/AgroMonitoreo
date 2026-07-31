import type { Moneda } from '../../../shared/types/domain.types'

export type NumeroQuincena = 1 | 2

export interface RangoQuincena {
  inicio: string
  fin: string
}

export interface PagoQuincenal {
  id: string
  trabajadorId: string
  quincenaInicio: string
  quincenaFin: string
  monto: number
  moneda: Moneda
  creadoEn: string
}

export interface FilaPlanilla {
  trabajadorId: string
  nombreCompleto: string
  fotoUrl: string | null
  salarioMensual: number
  moneda: Moneda
  montoQuincena: number
  // el pago ya registrado, con SU monto historico: si el salario cambio despues, la
  // fila muestra lo que realmente se pago, no montoQuincena
  pago: PagoQuincenal | null
}

export interface NuevoPagoQuincenal {
  fincaId: string
  trabajadorId: string
  quincenaInicio: string
  quincenaFin: string
  monto: number
  moneda: Moneda
}
