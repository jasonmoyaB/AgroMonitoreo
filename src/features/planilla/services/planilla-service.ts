import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { Moneda } from '../../../shared/types/domain.types'
import type { NuevoPagoQuincenal, PagoQuincenal } from '../types/planilla.types'

interface PagoRow {
  id: string
  trabajador_id: string
  quincena_inicio: string
  quincena_fin: string
  monto: number
  moneda: Moneda
  creado_en: string
}

export async function listarPagosQuincena(fincaId: string, quincenaInicio: string, client: SupabaseClient = supabase): Promise<PagoQuincenal[]> {
  const { data, error } = await client
    .from('pagos_quincenales')
    .select('id, trabajador_id, quincena_inicio, quincena_fin, monto, moneda, creado_en')
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
    moneda: row.moneda,
    creadoEn: row.creado_en,
  }))
}

// monto y moneda viajan explicitos porque son un snapshot: la fila queda con lo que se
// pago hoy, aunque manana el admin cambie el salario del trabajador.
// registrado_por no se manda: lo pone el default usuario_actual_id() en la BD.
export async function registrarPagoQuincena(input: NuevoPagoQuincenal, client: SupabaseClient = supabase): Promise<void> {
  const { error } = await client.from('pagos_quincenales').insert({
    finca_id: input.fincaId,
    trabajador_id: input.trabajadorId,
    quincena_inicio: input.quincenaInicio,
    quincena_fin: input.quincenaFin,
    monto: input.monto,
    moneda: input.moneda,
  })

  if (error) throw new Error(`registrarPagoQuincena: ${error.message}`)
}
