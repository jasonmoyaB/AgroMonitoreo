// Invita a un usuario nuevo por correo. Unico camino de alta: el signup publico esta cerrado.
// Solo un admin_oficina puede llamarla. El service_role nunca sale de este runtime.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const APP_URL = Deno.env.get('APP_URL')
const MAX_EMAIL = 254 // RFC 5321

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  // Sin este catch una excepcion inesperada sale como 500 crudo, sin headers CORS:
  // el navegador la reporta como error de CORS y el admin nunca ve la causa real.
  try {
    return await invitar(req)
  } catch (unknownError) {
    console.error('invitar-usuario:', unknownError)
    return responder({ error: 'Error inesperado al invitar. Revisá los logs de la función.' }, 500)
  }
})

async function invitar(req: Request): Promise<Response> {
  // Sin APP_URL el link caeria al Site URL y el invitado entraria sin definir contrasena.
  if (!APP_URL) return responder({ error: 'Falta configurar APP_URL en la funcion.' }, 500)

  const authorization = req.headers.get('Authorization')
  if (!authorization) return responder({ error: 'No hay sesión activa.' }, 401)

  // La organizacion del invitado sale de la fila del admin que invita, leida server-side
  // con SU token. Nunca del cuerpo del request: eso reabriria el agujero de escalada que
  // cerro 20260708183000, solo que un nivel mas arriba (elegir en que empresa nacer).
  const organizacionId = await organizacionDelAdminOficina(authorization)
  if (!organizacionId) return responder({ error: 'Solo la oficina puede invitar usuarios.' }, 403)

  const email = await leerEmail(req)
  if (!email) return responder({ error: 'Correo inválido.' }, 400)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${APP_URL!.replace(/\/$/, '')}/reset-password?invitacion=1`,
  })

  // 502 y no 400 cuando falla el SMTP: el correo pedido era valido, lo que falló es el envio.
  // Con 400 el log del edge no distingue "dato malo" de "SMTP caido" y el diagnostico se pierde.
  if (error) return responder({ error: traducirErrorInvitacion(error.message) }, esFallaDeEnvio(error.message) ? 502 : 400)

  return await estamparOrganizacion(admin, data.user.id, organizacionId)
}

// El trigger crear_usuario_desde_auth crea la fila de `usuario` sin organizacion: tiene
// prohibido leer raw_user_meta_data (decision 9), asi que no puede saber a que empresa
// pertenece el invitado. Se la ponemos aca, con service_role.
//
// Si el update falla, el usuario existe en auth pero sin organizacion: no veria nada
// (RouteGuard lo manda a SinFincaAsignada) y ningun admin podria arreglarlo desde la UI,
// porque las policies acotan por organizacion y la suya es null. Antes que dejar ese
// huerfano, se deshace el alta.
async function estamparOrganizacion(
  admin: ReturnType<typeof createClient>,
  authUserId: string,
  organizacionId: string,
): Promise<Response> {
  const { error } = await admin.from('usuario').update({ organizacion_id: organizacionId }).eq('auth_user_id', authUserId)
  if (!error) return responder({ ok: true }, 200)

  console.error('invitar-usuario: no se pudo asignar la organizacion, se revierte el alta:', error)
  await admin.auth.admin.deleteUser(authUserId)
  return responder({ error: 'No se pudo asignar la organización al invitado. No se creó la cuenta; intentá de nuevo.' }, 500)
}

// Devuelve la organizacion del llamador si es un admin_oficina activo, o null si no lo es.
// `verify_jwt` no alcanza: un supervisor tambien tiene un JWT valido.
async function organizacionDelAdminOficina(authorization: string): Promise<string | null> {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authorization } },
  })

  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) return null

  // Lo que acota a una fila es el .eq(), no la RLS: a un admin_oficina la policy de
  // `usuario` le alcanza todas las filas de su organizacion.
  const { data, error } = await client
    .from('usuario')
    .select('activo, organizacion_id, rol:roles(nombre)')
    .eq('auth_user_id', user.id)
    .single<{ activo: boolean; organizacion_id: string | null; rol: { nombre: string } | null }>()

  if (error) return null
  if (data?.activo !== true || data.rol?.nombre !== 'admin_oficina') return null

  // Un admin sin organizacion no puede invitar: el invitado no tendria a donde nacer.
  return data.organizacion_id
}

async function leerEmail(req: Request): Promise<string | null> {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (email.length > MAX_EMAIL) return null

  // Charset estricto: las plantillas interpolan {{ .Email }} en HTML, y `<>"` no tienen
  // por que llegar hasta ahi aunque GoTrue tambien valide el formato.
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email) ? email : null
}

function esFallaDeEnvio(mensaje: string): boolean {
  return mensaje.toLowerCase().includes('could not send email')
}

function traducirErrorInvitacion(mensaje: string): string {
  const normalizado = mensaje.toLowerCase()

  if (normalizado.includes('already been registered')) return 'Ese correo ya tiene cuenta.'
  if (normalizado.includes('rate limit')) return 'Se alcanzó el límite de correos por hora. Intentá más tarde.'
  // Resend sin dominio verificado solo entrega a la casilla dueña de la cuenta.
  if (normalizado.includes('only send testing emails')) {
    return 'El proveedor de correo está en modo prueba: solo entrega a la casilla dueña de la cuenta. Verificá un dominio para invitar a otras personas.'
  }
  if (esFallaDeEnvio(normalizado)) return 'No se pudo enviar el correo. Revisá la configuración de SMTP.'

  return mensaje
}

function responder(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
