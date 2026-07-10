import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listarAsistenciaPorRango } from '../services/asistencia-service'
import { obtenerRangoSemana } from '../utils/obtener-rango-semana'

const SEMANA_ACTUAL = 0

export function useAsistenciaSemana(fincaId: string) {
  const [offsetSemanas, setOffsetSemanas] = useState(SEMANA_ACTUAL)
  const rango = obtenerRangoSemana(offsetSemanas)

  const query = useQuery({
    queryKey: ['asistencia-semana', fincaId, rango.inicio, rango.fin],
    queryFn: () => listarAsistenciaPorRango(fincaId, rango.inicio, rango.fin),
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
