import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { REGISTROS_QUERY_KEY, REGISTROS_MES_QUERY_KEY } from '../../../../src/features/captura/constants/registros-query.constants'

const CLAVE_DEL_DIA = [REGISTROS_QUERY_KEY, '2026-07-10']
const CLAVE_DEL_MES = [REGISTROS_QUERY_KEY, REGISTROS_MES_QUERY_KEY, '2026-07']

function clienteConAmbasCaches(): QueryClient {
  const queryClient = new QueryClient()
  queryClient.setQueryData(CLAVE_DEL_DIA, [])
  queryClient.setQueryData(CLAVE_DEL_MES, [])
  return queryClient
}

describe('invalidacion de cache al crear un registro', () => {
  it('invalida tanto la cache del dia como la del mes que alimenta los KPIs', () => {
    const queryClient = clienteConAmbasCaches()

    queryClient.invalidateQueries({ queryKey: [REGISTROS_QUERY_KEY] })

    expect(queryClient.getQueryState(CLAVE_DEL_DIA)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(CLAVE_DEL_MES)?.isInvalidated).toBe(true)
  })

  it('invalidar solo por fecha (comportamiento anterior) deja la cache del mes sin refrescar', () => {
    const queryClient = clienteConAmbasCaches()

    queryClient.invalidateQueries({ queryKey: CLAVE_DEL_DIA })

    expect(queryClient.getQueryState(CLAVE_DEL_MES)?.isInvalidated).toBe(false)
  })
})
