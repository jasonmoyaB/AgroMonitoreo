import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { Moneda, SalarioTrabajador } from '../../../shared/types/domain.types'

interface SalarioRow {
  id: string
  nombre_completo: string
  foto_url: string | null
  asegurado: boolean
  salario: { salario_mensual: number; moneda: Moneda } | null
}

export async function listarSalariosPorFinca(fincaId: string, client: SupabaseClient = supabase): Promise<SalarioTrabajador[]> {
  const { data, error } = await client
    .from('trabajadores')
    .select('id, nombre_completo, foto_url, asegurado, salario:salarios_trabajadores(salario_mensual, moneda)')
    .eq('finca_id', fincaId)
    .order('nombre_completo', { ascending: true })
    .returns<SalarioRow[]>()

  if (error) throw new Error(`listarSalariosPorFinca: ${error.message}`)
  return data.map((row) => ({
    trabajadorId: row.id,
    nombreCompleto: row.nombre_completo,
    fotoUrl: row.foto_url,
    asegurado: row.asegurado,
    // sin fila en salarios_trabajadores todavia: el trabajador se creo despues de la
    // migracion y nadie le puso salario
    salarioMensual: row.salario?.salario_mensual ?? 0,
    moneda: row.salario?.moneda ?? 'colones',
  }))
}

// patch parcial a proposito: cada control de la tabla manda solo su campo, para que
// cambiar la moneda no reescriba un salario leido de props desactualizadas
export async function guardarSalario(
  input: { trabajadorId: string; salarioMensual?: number; moneda?: Moneda },
  client: SupabaseClient = supabase
): Promise<void> {
  const { error } = await client.from('salarios_trabajadores').upsert({
    trabajador_id: input.trabajadorId,
    ...(input.salarioMensual !== undefined && { salario_mensual: input.salarioMensual }),
    ...(input.moneda !== undefined && { moneda: input.moneda }),
    // actualizado_en lo sella el trigger salarios_trabajadores_tocar_actualizado_en:
    // un campo de auditoria no lo pone el cliente que escribe
  })

  if (error) throw new Error(`guardarSalario: ${error.message}`)
}
