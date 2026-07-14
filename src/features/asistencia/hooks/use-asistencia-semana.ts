import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ASISTENCIA_SEMANA_QUERY_KEY } from '../constants/asistencia-query.constants'
import { listarAsistenciaPorRango } from '../services/asistencia-service'
import { obtenerRangoSemana } from '../utils/obtener-rango-semana'

const SEMANA_ACTUAL = 0

export function useAsistenciaSemana(fincaId: string | undefined) {
  const [offsetSemanas, setOffsetSemanas] = useState(SEMANA_ACTUAL)
  const rango = obtenerRangoSemana(offsetSemanas)

  const query = useQuery({
    queryKey: [ASISTENCIA_SEMANA_QUERY_KEY, fincaId, rango.inicio, rango.fin],
    queryFn: () => listarAsistenciaPorRango(fincaId as string, rango.inicio, rango.fin),
    enabled: !!fincaId,
  })

  return {
    registros: query.data ?? [],
    isLoading: query.isLoading,
    rango,
    esSemanaActual: offsetSemanas === SEMANA_ACTUAL,
    irASemanaAnterior: () => setOffsetSemanas((valor) => valor - 1),
    irASemanaSiguiente: () => setOffsetSemanas((valor) => Math.min(valor + 1, SEMANA_ACTUAL)),
  }
}
