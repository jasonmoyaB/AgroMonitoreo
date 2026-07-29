import { useState } from 'react'

import { MESES } from '../../captura/constants/meses.constants'
import { construirAnioMes, descomponerFechaIso } from '../../../shared/utils/fecha-iso'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'

export function usePeriodoDashboard() {
  const hoy = descomponerFechaIso(fechaLocalIso())
  const [anio, setAnio] = useState(hoy.anio)
  const [mes, setMes] = useState(hoy.mes)

  return {
    anio,
    mes,
    setAnio,
    setMes,
    periodo: construirAnioMes(anio, mes),
    periodoNombre: `${MESES[mes - 1].nombre} ${anio}`,
  }
}
