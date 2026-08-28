export const PASSWORD_MIN_LENGTH = 8

// Chequeo contra contrasenas filtradas (HaveIBeenPwned). Reemplaza en el cliente al toggle
// "Leaked Password Protection" de Supabase Auth, que es de plan Pro y la org esta en Free.
// El protocolo es k-anonymity: se envian solo los primeros 5 caracteres del SHA-1, nunca la
// contrasena ni el hash completo.
export const PWNED_PASSWORDS_URL = 'https://api.pwnedpasswords.com/range'
export const PWNED_PREFIJO_LARGO = 5

// Mas corto que los 8s de Hacienda a proposito: esto esta en el camino critico de guardar
// una contrasena y falla abierto, asi que esperar mas no compra nada.
export const PWNED_TIMEOUT_MS = 4000

export const MENSAJE_PASSWORD_FILTRADA = 'Esa contraseña apareció en filtraciones de datos conocidas. Elegí otra.'
