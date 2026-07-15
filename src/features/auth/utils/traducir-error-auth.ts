const MENSAJES_ERROR_AUTH: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed': 'Debes confirmar tu correo antes de iniciar sesión.',
}

const MENSAJE_ERROR_AUTH_DEFAULT = 'No se pudo iniciar sesión. Intenta nuevamente.'

export function traducirErrorAuth(mensajeOriginal: string): string {
  return MENSAJES_ERROR_AUTH[mensajeOriginal] ?? MENSAJE_ERROR_AUTH_DEFAULT
}
