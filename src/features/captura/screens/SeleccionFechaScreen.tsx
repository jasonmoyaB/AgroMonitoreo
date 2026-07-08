import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardHeader } from '../components/WizardHeader'
import { MesGrid } from '../components/MesGrid'
import { NumericStepper } from '../../../shared/components/NumericStepper'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import { construirFechaIso, descomponerFechaIso } from '../utils/fecha-iso'
import { obtenerDiasEnMes } from '../utils/obtener-dias-en-mes'
import { ANIO_MINIMO, ANIO_MAXIMO } from '../constants/captura.constants'

const TOTAL_PASOS_FECHA = 1

export function SeleccionFechaScreen() {
  const navigate = useNavigate()
  const fecha = useCapturaSessionStore((state) => state.fecha)
  const establecerFecha = useCapturaSessionStore((state) => state.establecerFecha)
  const [{ anio, mes, dia }, setPartes] = useState(() => descomponerFechaIso(fecha))

  const diasEnMesActual = obtenerDiasEnMes(anio, mes)

  function actualizarAnio(nuevoAnio: number) {
    setPartes({ anio: nuevoAnio, mes, dia: Math.min(dia, obtenerDiasEnMes(nuevoAnio, mes)) })
  }

  function actualizarDia(nuevoDia: number) {
    setPartes({ anio, mes, dia: nuevoDia })
  }

  function seleccionarMes(nuevoMes: number) {
    const diaAjustado = Math.min(dia, obtenerDiasEnMes(anio, nuevoMes))
    establecerFecha(construirFechaIso({ anio, mes: nuevoMes, dia: diaAjustado }))
    navigate(-1)
  }

  return (
    <main className="flex min-h-screen flex-col">
      <WizardHeader paso={TOTAL_PASOS_FECHA} totalPasos={TOTAL_PASOS_FECHA} titulo="¿Qué fecha?" onAtras={() => navigate(-1)} />
      <div className="flex flex-wrap items-start justify-center gap-8 px-4 py-2">
        <NumericStepper
          label="Año"
          value={anio}
          step={1}
          rango={{ min: ANIO_MINIMO, max: ANIO_MAXIMO }}
          onChange={actualizarAnio}
        />
        <NumericStepper label="Día" value={dia} step={1} rango={{ min: 1, max: diasEnMesActual }} onChange={actualizarDia} />
      </div>
      <MesGrid mesSeleccionado={mes} onSeleccionar={seleccionarMes} />
    </main>
  )
}
