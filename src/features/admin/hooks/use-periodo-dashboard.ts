import { useState } from 'react'

import { construirAnioMes, descomponerFechaIso } from '../../../shared/utils/fecha-iso'
import { formatearPeriodoNombre } from '../../../shared/utils/formatear-periodo-nombre'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'

export function usePeriodoDashboard() {
  const hoy = descomponerFechaIso(fechaLocalIso())
  const [anio, setAnio] = useState(hoy.anio)
  const [mes, setMes] = useState(hoy.mes)

  const periodo = construirAnioMes(anio, mes)

  return { anio, mes, setAnio, setMes, periodo, periodoNombre: formatearPeriodoNombre(periodo) }
}
