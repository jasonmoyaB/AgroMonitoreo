import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { REGISTROS_QUERY_KEY, REGISTROS_TODOS_QUERY_KEY } from '../../../../src/features/captura/constants/registros-query.constants'

describe('invalidacion de cache al crear un registro', () => {
  it('invalida tanto la cache del dia como la cache de todos los registros', () => {
    const queryClient = new QueryClient()
    const claveDelDia = [REGISTROS_QUERY_KEY, '2026-07-10']
    const claveTodos = [REGISTROS_QUERY_KEY, REGISTROS_TODOS_QUERY_KEY]
    queryClient.setQueryData(claveDelDia, [])
    queryClient.setQueryData(claveTodos, [])

    queryClient.invalidateQueries({ queryKey: [REGISTROS_QUERY_KEY] })

    expect(queryClient.getQueryState(claveDelDia)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(claveTodos)?.isInvalidated).toBe(true)
  })

  it('invalidar solo por fecha (comportamiento anterior) deja la cache de todos sin refrescar', () => {
    const queryClient = new QueryClient()
    const claveDelDia = [REGISTROS_QUERY_KEY, '2026-07-10']
    const claveTodos = [REGISTROS_QUERY_KEY, REGISTROS_TODOS_QUERY_KEY]
    queryClient.setQueryData(claveDelDia, [])
    queryClient.setQueryData(claveTodos, [])

    queryClient.invalidateQueries({ queryKey: claveDelDia })

    expect(queryClient.getQueryState(claveTodos)?.isInvalidated).toBe(false)
  })
})
