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

  const esAdmin = await verificarAdminOficina(authorization)
  if (!esAdmin) return responder({ error: 'Solo la oficina puede invitar usuarios.' }, 403)

  const email = await leerEmail(req)
  if (!email) return responder({ error: 'Correo inválido.' }, 400)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${APP_URL.replace(/\/$/, '')}/reset-password?invitacion=1`,
  })

  // 502 y no 400 cuando falla el SMTP: el correo pedido era valido, lo que falló es el envio.
  // Con 400 el log del edge no distingue "dato malo" de "SMTP caido" y el diagnostico se pierde.
  if (error) return responder({ error: traducirErrorInvitacion(error.message) }, esFallaDeEnvio(error.message) ? 502 : 400)
  return responder({ ok: true }, 200)
}

async function verificarAdminOficina(authorization: string): Promise<boolean> {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authorization } },
  })

  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) return false

  // Lo que acota a una fila es el .eq() de abajo, no la RLS: a un admin_oficina
  // `usuario_select_admin_oficina` le alcanza la tabla entera.
  const { data, error } = await client
    .from('usuario')
    .select('activo, rol:roles(nombre)')
    .eq('auth_user_id', user.id)
    .single<{ activo: boolean; rol: { nombre: string } | null }>()

  if (error) return false
  return data?.activo === true && data.rol?.nombre === 'admin_oficina'
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
