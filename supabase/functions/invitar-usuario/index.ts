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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

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
    redirectTo: `${APP_URL}/reset-password?invitacion=1`,
  })

  // 502 y no 400 cuando falla el SMTP: el correo pedido era valido, lo que falló es el envio.
  // Con 400 el log del edge no distingue "dato malo" de "SMTP caido" y el diagnostico se pierde.
  if (error) return responder({ error: traducirErrorInvitacion(error.message) }, esFallaDeEnvio(error.message) ? 502 : 400)
  return responder({ ok: true }, 200)
})

async function verificarAdminOficina(authorization: string): Promise<boolean> {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authorization } },
  })

  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) return false

  // RLS aplica con el JWT del llamador: solo alcanza su propia fila.
  const { data } = await client
    .from('usuario')
    .select('activo, rol:roles(nombre)')
    .eq('auth_user_id', user.id)
    .single<{ activo: boolean; rol: { nombre: string } | null }>()

  return data?.activo === true && data.rol?.nombre === 'admin_oficina'
}

async function leerEmail(req: Request): Promise<string | null> {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
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
