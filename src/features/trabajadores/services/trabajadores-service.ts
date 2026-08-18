import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { Trabajador } from '../../../shared/types/domain.types'
import type { ActualizarTrabajadorInput, CrearTrabajadorInput } from '../types/trabajador-form.types'
import { mapearTrabajador, type TrabajadorRow } from '../utils/mapear-trabajador'
import { guardarDatosTrabajador } from './datos-trabajadores-service'

// sin el embed: lo usa la grilla del capataz en campo, que solo pinta nombre y foto.
// traer cedula y telefono ahi seria un join por carga y PII en memoria para nada.
const TRABAJADORES_COLUMNS = 'id, finca_id, nombre_completo, foto_url, activo, asegurado'

// El FK hay que nombrarlo: datos_trabajadores tiene DOS caminos hacia trabajadores
// (trabajador_id, y el compuesto datos_trabajadores_finca_coincide que fija la finca),
// asi que sin el `!nombre` PostgREST no desambigua y responde PGRST201.
//
// Y tiene que ser este FK, no el otro. Por trabajador_id_fkey el embed es 1:1 (es la
// PK) y vuelve objeto, que es lo que espera mapearTrabajador. Por finca_coincide vuelve
// ARRAY: no da error, pero row.datos?.cedula sobre un array es undefined y todas las
// cedulas quedarian en null en silencio.
const TRABAJADORES_COLUMNS_CON_DATOS = `${TRABAJADORES_COLUMNS}, datos:datos_trabajadores!datos_trabajadores_trabajador_id_fkey(cedula, fecha_ingreso, telefono)`

export async function listarTrabajadoresPorFinca(fincaId: string, client: SupabaseClient = supabase): Promise<Trabajador[]> {
  const { data, error } = await client
    .from('trabajadores')
    .select(TRABAJADORES_COLUMNS)
    .eq('finca_id', fincaId)
    .eq('activo', true)
    .order('nombre_completo', { ascending: true })
    .returns<TrabajadorRow[]>()

  if (error) throw new Error(`listarTrabajadoresPorFinca: ${error.message}`)
  return data.map(mapearTrabajador)
}

export async function listarTodosTrabajadoresPorFinca(fincaId: string, client: SupabaseClient = supabase): Promise<Trabajador[]> {
  const { data, error } = await client.from('trabajadores').select(TRABAJADORES_COLUMNS_CON_DATOS).eq('finca_id', fincaId).order('nombre_completo', { ascending: true }).returns<TrabajadorRow[]>()

  if (error) throw new Error(`listarTodosTrabajadoresPorFinca: ${error.message}`)
  return data.map(mapearTrabajador)
}

// Sin el embed a proposito. El rollup de oficina llama esto una vez POR FINCA solo para
// contar cabezas y armar el ranking por nombre: con TRABAJADORES_COLUMNS_CON_DATOS eso
// bajaba al navegador la cedula y el telefono de todas las fincas para calcular un
// promedio. Mismo criterio que TRABAJADORES_COLUMNS arriba.
export async function listarTodosTrabajadoresSinDatosPorFinca(fincaId: string, client: SupabaseClient = supabase): Promise<Trabajador[]> {
  const { data, error } = await client.from('trabajadores').select(TRABAJADORES_COLUMNS).eq('finca_id', fincaId).order('nombre_completo', { ascending: true }).returns<TrabajadorRow[]>()

  if (error) throw new Error(`listarTodosTrabajadoresSinDatosPorFinca: ${error.message}`)
  return data.map(mapearTrabajador)
}

export async function crearTrabajador(input: CrearTrabajadorInput, client: SupabaseClient = supabase): Promise<void> {
  const { data, error } = await client
    .from('trabajadores')
    .insert({
      finca_id: input.fincaId,
      nombre_completo: input.nombreCompleto.trim(),
      foto_url: input.fotoUrl.trim() || null,
      activo: input.activo,
      // asegurado no se manda: default false en la base, lo pone la oficina despues
    })
    .select('id')
    .single<{ id: string }>()

  if (error) throw new Error(`crearTrabajador: ${error.message}`)

  try {
    await guardarDatosTrabajador({ values: input, trabajadorId: data.id, fincaId: input.fincaId }, client)
  } catch (errorDatos) {
    await revertirTrabajadorSinDatos(data.id, client)
    throw errorDatos
  }
}

export async function actualizarTrabajador(input: ActualizarTrabajadorInput, client: SupabaseClient = supabase): Promise<void> {
  const { data, error } = await client
    .from('trabajadores')
    // sin asegurado: el patch parcial deja intacto lo que puso la oficina
    .update({ nombre_completo: input.nombreCompleto.trim(), foto_url: input.fotoUrl.trim() || null, activo: input.activo })
    .eq('id', input.id)
    .select('finca_id')
    .single<{ finca_id: string }>()

  if (error) throw new Error(`actualizarTrabajador: ${error.message}`)
  await guardarDatosTrabajador({ values: input, trabajadorId: input.id, fincaId: data.finca_id }, client)
}

// Compensa el alta a medias: el trabajador ya se inserto pero sus datos personales no.
// Desactiva en vez de borrar, y no es una preferencia de estilo — sobre
// public.trabajadores NO existe ninguna policy de DELETE (las dos del repo son la del
// bucket de fotos y la de asistencia). Como el grant si incluye delete, Postgres no
// rechaza nada: RLS no matchea ninguna fila, PostgREST responde 204 y `error` viene
// null. El .delete() que habia aca era una compensacion que no compensaba nada — la
// fila quedaba viva y activa, el capataz corregia la cedula, volvia a guardar, y
// terminaban dos trabajadores de la misma persona con los registros partidos entre los
// dos y dos liquidaciones en la planilla.
// El update si lo cubre trabajadores_update_own_finca, y activo=false saca la fila de
// todas las listas.
// ponytail: 2 escrituras + compensacion. Pasar a un rpc transaccional si esto tambien
// empieza a fallar (red caida justo en el peor momento).
async function revertirTrabajadorSinDatos(trabajadorId: string, client: SupabaseClient): Promise<void> {
  const { error } = await client.from('trabajadores').update({ activo: false }).eq('id', trabajadorId)

  // se pisa el error original a proposito: si la reversion falla, la fila queda activa y
  // el proximo intento duplica al trabajador. Eso importa mas que la cedula repetida.
  if (error) throw new Error(`crearTrabajador: se creó el trabajador ${trabajadorId} pero no sus datos, y no se pudo revertir: ${error.message}`)
}

export async function cambiarEstadoTrabajador(trabajador: Trabajador, client: SupabaseClient = supabase): Promise<Trabajador> {
  const { data, error } = await client.from('trabajadores').update({ activo: !trabajador.activo }).eq('id', trabajador.id).select(TRABAJADORES_COLUMNS_CON_DATOS).single<TrabajadorRow>()

  if (error) throw new Error(`cambiarEstadoTrabajador: ${error.message}`)
  return mapearTrabajador(data)
}

// patch parcial a proposito: manda solo asegurado para no pisar el resto de la fila
export async function cambiarAseguradoTrabajador(input: { id: string; asegurado: boolean }, client: SupabaseClient = supabase): Promise<Trabajador> {
  const { data, error } = await client.from('trabajadores').update({ asegurado: input.asegurado }).eq('id', input.id).select(TRABAJADORES_COLUMNS_CON_DATOS).single<TrabajadorRow>()

  if (error) throw new Error(`cambiarAseguradoTrabajador: ${error.message}`)
  return mapearTrabajador(data)
}
