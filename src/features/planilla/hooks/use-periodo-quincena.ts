import { useState } from 'react'
import { descomponerFechaIso } from '../../../shared/utils/fecha-iso'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'
import { PRIMERA_QUINCENA, SEGUNDA_QUINCENA, ULTIMO_DIA_PRIMERA_QUINCENA } from '../constants/quincena.constants'
import { obtenerRangoQuincena } from '../utils/obtener-rango-quincena'
import type { NumeroQuincena, RangoQuincena } from '../types/planilla.types'

interface PeriodoQuincena {
  anio: number
  mes: number
  quincena: NumeroQuincena
  rango: RangoQuincena
  setAnio: (anio: number) => void
  setMes: (mes: number) => void
  setQuincena: (quincena: NumeroQuincena) => void
}

// arranca en la quincena en curso: el admin casi siempre entra a pagar la de hoy
export function usePeriodoQuincena(): PeriodoQuincena {
  const hoy = descomponerFechaIso(fechaLocalIso())
  const [anio, setAnio] = useState(hoy.anio)
  const [mes, setMes] = useState(hoy.mes)
  const [quincena, setQuincena] = useState<NumeroQuincena>(hoy.dia <= ULTIMO_DIA_PRIMERA_QUINCENA ? PRIMERA_QUINCENA : SEGUNDA_QUINCENA)

  return { anio, mes, quincena, rango: obtenerRangoQuincena({ anio, mes, quincena }), setAnio, setMes, setQuincena }
}
