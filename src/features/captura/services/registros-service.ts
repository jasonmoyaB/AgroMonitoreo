import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { RegistroTrabajo } from '../../../shared/types/domain.types'
import { descomponerFechaIso, rangoIsoDelMes } from '../../../shared/utils/fecha-iso'

const REGISTROS_COLUMNS = 'id, finca_id, trabajador_id, tipo_labor_id, fecha, horas, cantidad, registrado_por, creado_en'
const CONFLICTO_UNICO_POR_DIA = 'trabajador_id,tipo_labor_id,fecha'
const TAMANO_PAGINA = 1000

export async function listarRegistrosPorFecha(fecha: string, client: SupabaseClient = supabase): Promise<RegistroTrabajo[]> {
  const { data, error } = await client.from('registros_trabajo').select(REGISTROS_COLUMNS).eq('fecha', fecha)

  if (error) throw new Error(`listarRegistrosPorFecha: ${error.message}`)
  return data.map(mapRegistro)
}

// Sin fincaId trae todas las fincas que la RLS deje ver, que es lo que necesita el rollup
// de oficina; con fincaId el filtro baja al servidor en vez de descartar en el cliente.
export async function listarRegistrosDelMes(anioMes: string, fincaId?: string, client: SupabaseClient = supabase): Promise<RegistroTrabajo[]> {
  const { desde, hastaExclusivo } = rangoIsoDelMes(anioMes)

  return paginarRegistros('listarRegistrosDelMes', (desdeFila, hastaFila) => {
    const delMes = client.from('registros_trabajo').select(REGISTROS_COLUMNS).gte('fecha', desde).lt('fecha', hastaExclusivo)
    const acotada = fincaId === undefined ? delMes : delMes.eq('finca_id', fincaId)
    return acotada.order('fecha').order('id').range(desdeFila, hastaFila)
  })
}

// El modal de metricas necesita el historial completo (de ahi salen los anios disponibles),
// asi que aca no hay rango de fechas que acote: la unica defensa contra el truncado es paginar.
export async function listarRegistrosPorTrabajador(trabajadorId: string, client: SupabaseClient = supabase): Promise<RegistroTrabajo[]> {
  return paginarRegistros('listarRegistrosPorTrabajador', (desdeFila, hastaFila) =>
    client
      .from('registros_trabajo')
      .select(REGISTROS_COLUMNS)
      .eq('trabajador_id', trabajadorId)
      .order('fecha')
      .order('id')
      .range(desdeFila, hastaFila)
  )
}

export async function obtenerAnioPrimerRegistro(client: SupabaseClient = supabase): Promise<number | null> {
  const { data, error } = await client.from('registros_trabajo').select('fecha').order('fecha').limit(1).maybeSingle()

  if (error) throw new Error(`obtenerAnioPrimerRegistro: ${error.message}`)
  return data ? descomponerFechaIso(data.fecha).anio : null
}

export async function crearRegistro(registro: RegistroTrabajo, client: SupabaseClient = supabase): Promise<RegistroTrabajo> {
  const { data, error } = await client
    .from('registros_trabajo')
    .upsert(
      {
        finca_id: registro.fincaId,
        trabajador_id: registro.trabajadorId,
        tipo_labor_id: registro.tipoLaborId,
        fecha: registro.fecha,
        horas: registro.horas,
        cantidad: registro.cantidad,
      },
      { onConflict: CONFLICTO_UNICO_POR_DIA }
    )
    .select(REGISTROS_COLUMNS)
    .single()

  if (error) throw new Error(`crearRegistro: ${error.message}`)
  return mapRegistro(data)
}

interface PaginaRegistros {
  data: RegistroRow[] | null
  error: { message: string } | null
}

// PostgREST corta cada respuesta en max-rows (1000): traer la tabla entera truncaba en
// silencio apenas pasado el primer mes de uso y los KPIs salian bajos sin ningun aviso.
// Se pagina hasta que la base deja de devolver filas. El orden tiene que ser estable
// (fecha + id) o `range` puede repetir u omitir filas entre una pagina y la siguiente.
async function paginarRegistros(
  nombreFuncion: string,
  pedirPagina: (desde: number, hasta: number) => PromiseLike<PaginaRegistros>
): Promise<RegistroTrabajo[]> {
  const registros: RegistroTrabajo[] = []

  for (;;) {
    const { data, error } = await pedirPagina(registros.length, registros.length + TAMANO_PAGINA - 1)

    if (error) throw new Error(`${nombreFuncion}: ${error.message}`)
    if (data === null || data.length === 0) return registros
    registros.push(...data.map(mapRegistro))
  }
}

interface RegistroRow {
  id: string
  finca_id: string
  trabajador_id: string
  tipo_labor_id: string
  fecha: string
  horas: number
  cantidad: number | null
  registrado_por: string
  creado_en: string
}

function mapRegistro(row: RegistroRow): RegistroTrabajo {
  return {
    id: row.id,
    fincaId: row.finca_id,
    trabajadorId: row.trabajador_id,
    tipoLaborId: row.tipo_labor_id,
    fecha: row.fecha,
    horas: row.horas,
    cantidad: row.cantidad,
    registradoPor: row.registrado_por,
    createdAt: row.creado_en,
  }
}
