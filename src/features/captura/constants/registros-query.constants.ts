export const REGISTROS_QUERY_KEY = 'registros'
export const REGISTROS_MES_QUERY_KEY = 'mes'
export const REGISTROS_TRABAJADOR_QUERY_KEY = 'trabajador'
export const REGISTROS_PRIMER_ANIO_QUERY_KEY = 'primer-anio'

// La clave de la cache del dia se arma en un solo lugar: la lee `use-registros-del-dia` y la
// escribe la actualizacion optimista de `use-crear-registro`. Duplicarla a mano hacia que
// agregarle un segmento dejara la escritura optimista apuntando a una clave huerfana, sin
// error y con el sintoma del bug original: la grid sin check verde.
export const claveRegistrosDelDia = (fecha: string) => [REGISTROS_QUERY_KEY, fecha] as const

// Clave de mutacion, no de query: es lo que permite reanudar un registro que quedo pausado
// sin señal y sobrevivio a un reload (ver src/app/query-client.ts).
export const CREAR_REGISTRO_MUTATION_KEY = [REGISTROS_QUERY_KEY, 'crear'] as const
