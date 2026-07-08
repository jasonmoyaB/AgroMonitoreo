import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import type { TipoLabor } from '../../../shared/types/domain.types'
import { crearTareasLabor } from '../utils/crear-tareas-labor'

const LABORES_PENDIENTES = crearTareasLabor(TIPOS_LABOR)

export function useSupervisorDashboard() {
  const navigate = useNavigate()
  const seleccionarLabor = useCapturaSessionStore((state) => state.seleccionarLabor)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  function toggleSidebar() {
    setIsSidebarCollapsed((isCollapsed) => !isCollapsed)
  }

  function seleccionarLaborPendiente(tipoLabor: TipoLabor) {
    seleccionarLabor(tipoLabor.id)
    navigate(`/captura/labor/${tipoLabor.id}/trabajadores`)
  }

  return {
    laboresPendientes: LABORES_PENDIENTES,
    totalLabores: LABORES_PENDIENTES.length,
    isSidebarCollapsed,
    toggleSidebar,
    seleccionarLaborPendiente,
  }
}
