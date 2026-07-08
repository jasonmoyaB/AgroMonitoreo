import { useNavigate } from 'react-router-dom'
import { LaborGrid } from '../components/LaborGrid'
import { SupervisorProfileButton } from '../components/SupervisorProfileButton'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import type { TipoLabor } from '../../../shared/types/domain.types'

export function SeleccionLaborScreen() {
  const navigate = useNavigate()
  const seleccionarLabor = useCapturaSessionStore((state) => state.seleccionarLabor)
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()

  function manejarSeleccion(tipoLabor: TipoLabor) {
    seleccionarLabor(tipoLabor.id)
    navigate(`/captura/labor/${tipoLabor.id}/trabajadores`)
  }

  return (
    <main className="min-h-screen">
      <header className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-center text-2xl font-black text-slate-800 sm:text-left">¿Qué labor?</h1>
        <SupervisorProfileButton isSigningOut={isSigningOut} onSignOut={handleCerrarSesion} />
      </header>
      <LaborGrid tiposLabor={TIPOS_LABOR} onSeleccionar={manejarSeleccion} />
    </main>
  )
}
