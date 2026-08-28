import { describe, expect, it } from 'vitest'
import { esClavePersistible } from '../../src/app/claves-persistibles'
import { REGISTROS_QUERY_KEY, REGISTROS_MES_QUERY_KEY } from '../../src/features/captura/constants/registros-query.constants'
import { TRABAJADORES_QUERY_KEY } from '../../src/features/trabajadores/constants/trabajadores-query.constants'
import { ASISTENCIA_DIA_QUERY_KEY, ASISTENCIA_MES_QUERY_KEY } from '../../src/features/asistencia/constants/asistencia-query.constants'
import { USUARIO_ACTUAL_QUERY_KEY } from '../../src/features/auth/constants/usuario-query.constants'
import { DATOS_PERSONALES_QUERY_KEY } from '../../src/features/perfil/constants/perfil-query.constants'
import { PLANILLA_QUERY_KEY } from '../../src/features/planilla/constants/quincena.constants'

describe('esClavePersistible', () => {
  it('deja pasar lo que la captura sin señal necesita', () => {
    expect(esClavePersistible([REGISTROS_QUERY_KEY, '2026-07-10'])).toBe(true)
    expect(esClavePersistible([TRABAJADORES_QUERY_KEY, 'birrisito'])).toBe(true)
    expect(esClavePersistible([ASISTENCIA_DIA_QUERY_KEY, '2026-07-10', 'birrisito'])).toBe(true)
    expect(esClavePersistible(USUARIO_ACTUAL_QUERY_KEY)).toBe(true)
  })

  it('nunca persiste la planilla: el salario no va al disco del dispositivo', () => {
    expect(esClavePersistible([PLANILLA_QUERY_KEY, 'birrisito', '2026-07-01'])).toBe(false)
  })

  it('nunca persiste los datos personales del operador', () => {
    expect(esClavePersistible(DATOS_PERSONALES_QUERY_KEY)).toBe(false)
  })

  it('un prefijo parecido no alcanza: se compara la raiz completa', () => {
    expect(esClavePersistible([ASISTENCIA_MES_QUERY_KEY, '2026-07'])).toBe(false)
    expect(esClavePersistible(['trabajadores-admin', 'birrisito'])).toBe(false)
  })

  it('una clave sin raiz de texto no se persiste', () => {
    expect(esClavePersistible([])).toBe(false)
    expect(esClavePersistible([{ scope: REGISTROS_QUERY_KEY }])).toBe(false)
  })

  it('la clave del mes entra por su raiz, igual que la del dia', () => {
    expect(esClavePersistible([REGISTROS_QUERY_KEY, REGISTROS_MES_QUERY_KEY, '2026-07', 'todas'])).toBe(true)
  })
})
