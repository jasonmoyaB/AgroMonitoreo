import { useNavigate } from 'react-router-dom'
import { LaborGrid } from '../components/LaborGrid'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import type { TipoLabor } from '../../../shared/types/domain.types'

export function SeleccionLaborScreen() {
  const navigate = useNavigate()
  const seleccionarLabor = useCapturaSessionStore((state) => state.seleccionarLabor)

  function manejarSeleccion(tipoLabor: TipoLabor) {
    seleccionarLabor(tipoLabor.id)
    navigate(`/captura/labor/${tipoLabor.id}/trabajadores`)
  }

  return (
    <main className="min-h-screen">
      <h1 className="p-4 text-center text-2xl font-black text-slate-800">¿Qué labor?</h1>
      <LaborGrid tiposLabor={TIPOS_LABOR} onSeleccionar={manejarSeleccion} />
    </main>
  )
}
