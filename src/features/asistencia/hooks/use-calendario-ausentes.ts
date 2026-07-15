import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ASISTENCIA_MES_QUERY_KEY } from '../constants/asistencia-query.constants'
import { listarAsistenciaPorRango } from '../services/asistencia-service'
import { construirFechaIso } from '../../captura/utils/fecha-iso'
import { obtenerDiasEnMes } from '../../captura/utils/obtener-dias-en-mes'

export function useCalendarioAusentes(fincaId: string | undefined) {
  const hoy = new Date()
  const [fecha, setFecha] = useState({ anio: hoy.getFullYear(), mes: hoy.getMonth() + 1 })
  const desde = construirFechaIso({ ...fecha, dia: 1 })
  const hasta = construirFechaIso({ ...fecha, dia: obtenerDiasEnMes(fecha.anio, fecha.mes) })

  const query = useQuery({
    queryKey: [ASISTENCIA_MES_QUERY_KEY, fincaId, desde, hasta],
    queryFn: () => listarAsistenciaPorRango(fincaId as string, desde, hasta),
    enabled: !!fincaId,
  })

  function cambiarMes(direccion: -1 | 1) {
    const siguiente = new Date(fecha.anio, fecha.mes - 1 + direccion, 1)
    setFecha({ anio: siguiente.getFullYear(), mes: siguiente.getMonth() + 1 })
  }

  return {
    anio: fecha.anio,
    mes: fecha.mes,
    registros: query.data ?? [],
    isLoading: query.isLoading,
    cambiarMes,
  }
}
