import type { SupabaseClient } from '@supabase/supabase-js'
import type { TrabajadorFormValues } from '../types/trabajador-form.types'

// Code de Postgres para violacion de indice unico. El unico que puede chocar aca es
// datos_trabajadores_finca_cedula_idx: el conflicto de la PK lo resuelve el propio upsert.
const CODIGO_UNICIDAD_VIOLADA = '23505'

// un input vacio es '', no null: sin esto la cedula guardaria '' y el indice unico
// parcial la tomaria como valor real, chocando entre dos trabajadores sin cedula.
function aNullSiVacio(valor: string): string | null {
  return valor.trim() || null
}

interface GuardarDatosTrabajadorInput {
  values: TrabajadorFormValues
  trabajadorId: string
  fincaId: string
}

export async function guardarDatosTrabajador(input: GuardarDatosTrabajadorInput, client: SupabaseClient): Promise<void> {
  const { values } = input
  const { error } = await client.from('datos_trabajadores').upsert({
    trabajador_id: input.trabajadorId,
    finca_id: input.fincaId,
    cedula: aNullSiVacio(values.cedula),
    fecha_ingreso: aNullSiVacio(values.fechaIngreso),
    telefono: aNullSiVacio(values.telefono),
  })

  if (!error) return

  // es el error que mas le va a salir al capataz, y el crudo de Postgres es
  // "duplicate key value violates unique constraint datos_trabajadores_finca_cedula_idx":
  // ilegible para el uso en campo, y no dice cual de los tres campos hay que corregir.
  if (error.code === CODIGO_UNICIDAD_VIOLADA) throw new Error('Esa cédula ya está registrada en otro trabajador de la finca.')

  throw new Error(`guardarDatosTrabajador: ${error.message}`)
}
