import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { Moneda } from '../../../shared/types/domain.types'
import type { NuevoPagoQuincenal, PagoQuincenal } from '../types/planilla.types'

const PAGOS_COLUMNS = 'id, trabajador_id, quincena_inicio, quincena_fin, monto, monto_bruto, dias_ausentes, moneda, creado_en'

interface PagoRow {
  id: string
  trabajador_id: string
  quincena_inicio: string
  quincena_fin: string
  monto: number
  monto_bruto: number
  dias_ausentes: number
  moneda: Moneda
  creado_en: string
}

export async function listarPagosQuincena(fincaId: string, quincenaInicio: string, client: SupabaseClient = supabase): Promise<PagoQuincenal[]> {
  const { data, error } = await client
    .from('pagos_quincenales')
    .select(PAGOS_COLUMNS)
    .eq('finca_id', fincaId)
    .eq('quincena_inicio', quincenaInicio)
    .returns<PagoRow[]>()

  if (error) throw new Error(`listarPagosQuincena: ${error.message}`)
  return data.map((row) => ({
    id: row.id,
    trabajadorId: row.trabajador_id,
    quincenaInicio: row.quincena_inicio,
    quincenaFin: row.quincena_fin,
    monto: row.monto,
    montoBruto: row.monto_bruto,
    diasAusentes: row.dias_ausentes,
    moneda: row.moneda,
    creadoEn: row.creado_en,
  }))
}

// monto, monto_bruto, dias_ausentes y moneda viajan explicitos porque son un snapshot: la
// fila queda con lo que se pago hoy y por que, aunque manana el admin cambie el salario,
// el valor hora o borre una ausencia.
// registrado_por no se manda: lo pone el default usuario_actual_id() en la BD.
export async function registrarPagoQuincena(input: NuevoPagoQuincenal, client: SupabaseClient = supabase): Promise<void> {
  const { error } = await client.from('pagos_quincenales').insert({
    finca_id: input.fincaId,
    trabajador_id: input.trabajadorId,
    quincena_inicio: input.quincenaInicio,
    quincena_fin: input.quincenaFin,
    monto: input.monto,
    monto_bruto: input.montoBruto,
    dias_ausentes: input.diasAusentes,
    moneda: input.moneda,
  })

  if (error) throw new Error(`registrarPagoQuincena: ${error.message}`)
}
