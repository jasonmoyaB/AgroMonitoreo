import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'
import { formatearFechaIsoCorta } from '../../../shared/utils/formatear-fecha'
import type { TipoLabor } from '../../../shared/types/domain.types'
import { crearTareasLabor } from '../utils/crear-tareas-labor'

const LABORES_PENDIENTES = crearTareasLabor(TIPOS_LABOR)

export function useSupervisorDashboard() {
  const navigate = useNavigate()
  const seleccionarLabor = useCapturaSessionStore((state) => state.seleccionarLabor)
  const fechaCaptura = useCapturaSessionStore((state) => state.fecha)
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
    isSidebarCollapsed,
    toggleSidebar,
    seleccionarLaborPendiente,
    fechaCaptura: formatearFechaIsoCorta(fechaCaptura),
    esFechaDeHoy: fechaCaptura === fechaLocalIso(),
    abrirSelectorFecha: () => navigate('/captura/fecha'),
  }
}
