import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { Trabajador } from '../../../shared/types/domain.types'
import { BUCKET_FOTOS_TRABAJADORES, EXTENSION_POR_MIME, type TipoMimePermitido } from '../constants/foto-trabajador.constants'
import type { ActualizarTrabajadorInput, CrearTrabajadorInput, TrabajadorFormValues } from '../types/trabajador-form.types'

// El FK hay que nombrarlo: datos_trabajadores tiene DOS caminos hacia trabajadores
// (trabajador_id, y el compuesto datos_trabajadores_finca_coincide que fija la finca),
// asi que sin el `!nombre` PostgREST no desambigua y responde PGRST201.
//
// Y tiene que ser este FK, no el otro. Por trabajador_id_fkey el embed es 1:1 (es la
// PK) y vuelve objeto, que es lo que espera mapTrabajador. Por finca_coincide vuelve
// ARRAY: no da error, pero row.datos?.cedula sobre un array es undefined y todas las
// cedulas quedarian en null en silencio.
const TRABAJADORES_COLUMNS =
  'id, finca_id, nombre_completo, foto_url, activo, asegurado, ' +
  'datos:datos_trabajadores!datos_trabajadores_trabajador_id_fkey(cedula, fecha_ingreso, telefono)'

interface DatosRow {
  cedula: string | null
  fecha_ingreso: string | null
  telefono: string | null
}

interface TrabajadorRow {
  id: string
  finca_id: string
  nombre_completo: string
  foto_url: string | null
  activo: boolean
  asegurado: boolean
  datos: DatosRow | null
}

// un input vacio es '', no null: sin esto la cedula guardaria '' y el indice unico
// parcial la tomaria como valor real, chocando entre dos trabajadores sin cedula.
function aNullSiVacio(valor: string): string | null {
  return valor.trim() || null
}

export async function subirFotoTrabajador(input: { fincaId: string; archivo: File }, client: SupabaseClient = supabase): Promise<string> {
  const extension = EXTENSION_POR_MIME[input.archivo.type as TipoMimePermitido]
  const ruta = `${input.fincaId}/${crypto.randomUUID()}.${extension}`

  const { error } = await client.storage.from(BUCKET_FOTOS_TRABAJADORES).upload(ruta, input.archivo, {
    contentType: input.archivo.type,
    cacheControl: '3600',
  })
  if (error) throw new Error(`subirFotoTrabajador: ${error.message}`)

  return client.storage.from(BUCKET_FOTOS_TRABAJADORES).getPublicUrl(ruta).data.publicUrl
}

export async function listarTrabajadoresPorFinca(fincaId: string, client: SupabaseClient = supabase): Promise<Trabajador[]> {
  const { data, error } = await client
    .from('trabajadores')
    .select(TRABAJADORES_COLUMNS)
    .eq('finca_id', fincaId)
    .eq('activo', true)
    .order('nombre_completo', { ascending: true })
    .returns<TrabajadorRow[]>()

  if (error) throw new Error(`listarTrabajadoresPorFinca: ${error.message}`)
  return data.map(mapTrabajador)
}

export async function listarTodosTrabajadoresPorFinca(fincaId: string, client: SupabaseClient = supabase): Promise<Trabajador[]> {
  const { data, error } = await client.from('trabajadores').select(TRABAJADORES_COLUMNS).eq('finca_id', fincaId).order('nombre_completo', { ascending: true }).returns<TrabajadorRow[]>()

  if (error) throw new Error(`listarTodosTrabajadoresPorFinca: ${error.message}`)
  return data.map(mapTrabajador)
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
  await guardarDatosTrabajador({ values: input, trabajadorId: data.id, fincaId: input.fincaId }, client)
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

// segundo round trip, no atomico: si falla, el trabajador queda guardado sin datos
// personales. los 4 campos son nullable, asi que la fila sigue siendo valida y el
// error se ve en pantalla.
// ponytail: 2 escrituras sueltas, pasar a un rpc transaccional si aparece media fila.
async function guardarDatosTrabajador(input: { values: TrabajadorFormValues; trabajadorId: string; fincaId: string }, client: SupabaseClient): Promise<void> {
  const { values } = input
  const { error } = await client.from('datos_trabajadores').upsert({
    trabajador_id: input.trabajadorId,
    finca_id: input.fincaId,
    cedula: aNullSiVacio(values.cedula),
    fecha_ingreso: aNullSiVacio(values.fechaIngreso),
    telefono: aNullSiVacio(values.telefono),
  })

  if (error) throw new Error(`guardarDatosTrabajador: ${error.message}`)
}

export async function cambiarEstadoTrabajador(trabajador: Trabajador, client: SupabaseClient = supabase): Promise<Trabajador> {
  const { data, error } = await client.from('trabajadores').update({ activo: !trabajador.activo }).eq('id', trabajador.id).select(TRABAJADORES_COLUMNS).single<TrabajadorRow>()

  if (error) throw new Error(`cambiarEstadoTrabajador: ${error.message}`)
  return mapTrabajador(data)
}

// patch parcial a proposito: manda solo asegurado para no pisar el resto de la fila
export async function cambiarAseguradoTrabajador(input: { id: string; asegurado: boolean }, client: SupabaseClient = supabase): Promise<Trabajador> {
  const { data, error } = await client.from('trabajadores').update({ asegurado: input.asegurado }).eq('id', input.id).select(TRABAJADORES_COLUMNS).single<TrabajadorRow>()

  if (error) throw new Error(`cambiarAseguradoTrabajador: ${error.message}`)
  return mapTrabajador(data)
}

function mapTrabajador(row: TrabajadorRow): Trabajador {
  return {
    id: row.id,
    fincaId: row.finca_id,
    nombreCompleto: row.nombre_completo,
    fotoUrl: row.foto_url,
    activo: row.activo,
    asegurado: row.asegurado,
    cedula: row.datos?.cedula ?? null,
    fechaIngreso: row.datos?.fecha_ingreso ?? null,
    telefono: row.datos?.telefono ?? null,
  }
}
