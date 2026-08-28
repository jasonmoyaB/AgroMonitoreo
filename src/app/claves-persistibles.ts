import { REGISTROS_QUERY_KEY } from '../features/captura/constants/registros-query.constants'
import { TRABAJADORES_QUERY_KEY } from '../features/trabajadores/constants/trabajadores-query.constants'
import { ASISTENCIA_DIA_QUERY_KEY } from '../features/asistencia/constants/asistencia-query.constants'
import { TRABAJADORES_PRESTADOS_QUERY_KEY, TRABAJADORES_TRASLADADOS_HOY_QUERY_KEY } from '../features/traslados/constants/traslados-query.constants'
import { USUARIO_ACTUAL_QUERY_KEY } from '../features/auth/constants/usuario-query.constants'

// Allowlist, nunca denylist: lo que se persiste queda en el disco del dispositivo hasta el
// proximo cierre de sesion, asi que sumar una clave tiene que ser una decision explicita.
// Entra solo lo que la captura sin señal necesita para pintarse.
// Queda afuera a proposito todo lo de oficina: `planilla` (salario mensual y moneda por
// trabajador), `perfil` (datos personales del operador), los rollups de admin y las metricas
// por trabajador. Nada de eso sirve offline, y el salario esta en su propia tabla justamente
// para que no viaje de mas (`decisiones.md` 3).
const CLAVES_PERSISTIBLES: readonly string[] = [
  REGISTROS_QUERY_KEY,
  TRABAJADORES_QUERY_KEY,
  ASISTENCIA_DIA_QUERY_KEY,
  TRABAJADORES_PRESTADOS_QUERY_KEY,
  TRABAJADORES_TRASLADADOS_HOY_QUERY_KEY,
  USUARIO_ACTUAL_QUERY_KEY[0],
]

export function esClavePersistible(queryKey: readonly unknown[]): boolean {
  const raiz = queryKey[0]

  return typeof raiz === 'string' && CLAVES_PERSISTIBLES.includes(raiz)
}
