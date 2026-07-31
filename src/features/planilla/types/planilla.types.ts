import type { Moneda, TipoAusencia } from '../../../shared/types/domain.types'

export interface AusenciaEnQuincena {
  fecha: string
  tipo: TipoAusencia
}

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
  // monto es el neto que se pago. montoBruto y diasAusentes viajan con el para que la
  // liquidacion pueda explicar ese neto aunque despues cambien el salario o la asistencia
  monto: number
  montoBruto: number
  diasAusentes: number
  moneda: Moneda
  creadoEn: string
}

export interface FilaPlanilla {
  trabajadorId: string
  nombreCompleto: string
  fotoUrl: string | null
  salarioMensual: number
  moneda: Moneda
  // referencia informativa: el salario mensual llevado a semana. no se paga ni se registra
  montoSemanal: number
  // bruto de la quincena: la mitad del salario, sin descontar ausencias
  montoQuincena: number
  // los dias faltados dentro del rango, ordenados: la cantidad es .length y el detalle
  // alimenta el modal de la columna Ausencias
  ausencias: readonly AusenciaEnQuincena[]
  // lo que se pagaria hoy: bruto menos las ausencias de esta quincena, nunca negativo
  montoNeto: number
  // el pago ya registrado, con SU monto historico: si el salario cambio despues, la
  // fila muestra lo que realmente se pago, no montoNeto
  pago: PagoQuincenal | null
}

export interface NuevoPagoQuincenal {
  fincaId: string
  trabajadorId: string
  quincenaInicio: string
  quincenaFin: string
  monto: number
  montoBruto: number
  diasAusentes: number
  moneda: Moneda
}
