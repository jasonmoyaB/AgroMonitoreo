// La URL es publica y sin llave, asi que el default vive en el codigo y no en una env.
// Sin el, que la env faltara en Vercel no rompia el build (Vite hornea `undefined`) y la
// consulta salia a `undefined?identificacion=...`, que es una ruta RELATIVA: contra el
// rewrite SPA de vercel.json el propio dominio devuelve index.html con 200, el .json()
// revienta con un SyntaxError que no dice nada, y de paso la cedula queda escrita en el
// access log del sitio. Con default, ese modo de falla no existe.
const HACIENDA_CONTRIBUYENTE_URL_POR_DEFECTO = 'https://api.hacienda.go.cr/fe/ae'

const urlConfigurada = import.meta.env.VITE_HACIENDA_CONTRIBUYENTE_URL || HACIENDA_CONTRIBUYENTE_URL_POR_DEFECTO

// Falla al cargar el modulo y no en la primera consulta: un override mal escrito es un
// error de configuracion, y enterarse al arrancar es mas barato que enterarse cuando el
// capataz ya tipeo una cedula en el campo. Se exige https porque la cedula viaja en el
// query string. El default siempre pasa, asi que esto solo puede dispararlo un override.
if (!urlConfigurada.startsWith('https://')) {
  throw new Error(`hacienda.constants: VITE_HACIENDA_CONTRIBUYENTE_URL debe ser una URL https, se recibió "${urlConfigurada}"`)
}

export const HACIENDA_CONTRIBUYENTE_URL = urlConfigurada

export const HACIENDA_QUERY_KEY = ['hacienda', 'contribuyente']

// cedula fisica 9, juridica 10, DIMEX 11-12. Fuera de ese rango ni vale la pena
// preguntar: la API responde 400 con HTML.
export const CEDULA_LARGO_MINIMO = 9
export const CEDULA_LARGO_MAXIMO = 12

export const HACIENDA_NO_ENCONTRADO = 404

// Corta la espera contra una API de gobierno que acepta la conexion y despues no
// contesta. Sin esto la promesa queda pendiente para siempre y, como la query usa
// staleTime Infinity, volver al campo reengancha esa misma promesa colgada: el capataz
// ve "Consultando Hacienda..." de forma permanente, sin isError y sin salida.
export const HACIENDA_TIMEOUT_MS = 8000

// La API manda los flags como "SI"/"NO", no como booleanos.
export const HACIENDA_FLAG_SI = 'SI'
