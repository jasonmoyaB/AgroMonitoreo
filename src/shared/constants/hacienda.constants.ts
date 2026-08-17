export const HACIENDA_CONTRIBUYENTE_URL = import.meta.env.VITE_HACIENDA_CONTRIBUYENTE_URL

export const HACIENDA_QUERY_KEY = ['hacienda', 'contribuyente']

// cedula fisica 9, juridica 10, DIMEX 11-12. Fuera de ese rango ni vale la pena
// preguntar: la API responde 400 con HTML.
export const CEDULA_LARGO_MINIMO = 9
export const CEDULA_LARGO_MAXIMO = 12

export const HACIENDA_NO_ENCONTRADO = 404
