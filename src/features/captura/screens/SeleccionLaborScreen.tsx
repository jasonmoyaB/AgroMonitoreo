import { useNavigate } from 'react-router-dom'
import { LaborGrid } from '../components/LaborGrid'
import { WizardHeader } from '../components/WizardHeader'
import { SelectorFechaChip } from '../components/SelectorFechaChip'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import type { TipoLabor } from '../../../shared/types/domain.types'

const TOTAL_PASOS_CAPTURA = 3

export function SeleccionLaborScreen() {
  const navigate = useNavigate()
  const fecha = useCapturaSessionStore((state) => state.fecha)
  const seleccionarLabor = useCapturaSessionStore((state) => state.seleccionarLabor)

  function manejarSeleccion(tipoLabor: TipoLabor) {
    seleccionarLabor(tipoLabor.id)
    navigate(`/captura/labor/${tipoLabor.id}/trabajadores`)
  }

  return (
    <main className="min-h-screen">
      <WizardHeader paso={1} totalPasos={TOTAL_PASOS_CAPTURA} titulo="¿Qué labor?" onAtras={() => navigate('/supervisor')} />
      <div className="flex flex-wrap items-center gap-3 px-4">
        <SelectorFechaChip fecha={fecha} onClick={() => navigate('/captura/fecha')} />
      </div>
      <LaborGrid tiposLabor={TIPOS_LABOR} onSeleccionar={manejarSeleccion} />
    </main>
  )
}
