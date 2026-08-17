// Mismo regex que el check usuario_email_contacto_formato (20260817183613), que a
// su vez copia el de usuario.email (20260708173349). Existe aparte de
// `<input type="email">` porque el validador nativo del navegador acepta dominios
// sin punto: "juan@gmail" pasa el submit y lo rechaza recien el check de Postgres,
// que devuelve un 400 con el nombre de la constraint en vez de algo legible.
const FORMATO_EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

/** Devuelve el mensaje de error, o null si el valor sirve. Vacio es valido: el campo es opcional. */
export function validarEmailContacto(email: string): string | null {
  const limpio = email.trim()
  if (!limpio) return null
  if (!FORMATO_EMAIL.test(limpio)) return 'El correo de contacto no tiene un formato válido.'
  return null
}
