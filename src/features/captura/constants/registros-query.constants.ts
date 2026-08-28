export const REGISTROS_QUERY_KEY = 'registros'
export const REGISTROS_MES_QUERY_KEY = 'mes'
export const REGISTROS_TRABAJADOR_QUERY_KEY = 'trabajador'
export const REGISTROS_PRIMER_ANIO_QUERY_KEY = 'primer-anio'

// Clave de mutacion, no de query: es lo que permite reanudar un registro que quedo pausado
// sin señal y sobrevivio a un reload (ver src/app/query-client.ts).
export const CREAR_REGISTRO_MUTATION_KEY = [REGISTROS_QUERY_KEY, 'crear'] as const
