import { useNavigate, useParams } from 'react-router-dom'
import { WorkersGrid } from '../components/WorkersGrid'
import { ProgresoDelDia } from '../components/ProgresoDelDia'
import { useTrabajadoresPorFinca } from '../hooks/use-trabajadores-por-finca'
import { useRegistrosDelDia } from '../hooks/use-registros-del-dia'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import type { Trabajador } from '../../../shared/types/domain.types'

export function TrabajadoresScreen() {
  const { tipoLaborId = '' } = useParams<{ tipoLaborId: string }>()
  const navigate = useNavigate()
  const fecha = useCapturaSessionStore((state) => state.fecha)

  const { data: trabajadores = [] } = useTrabajadoresPorFinca(FINCA_ACTUAL.id)
  const { data: registros = [] } = useRegistrosDelDia(fecha)

  function manejarSeleccion(trabajador: Trabajador) {
    navigate(`/captura/labor/${tipoLaborId}/trabajadores/${trabajador.id}`)
  }

  const registrados = registros.filter((registro) => registro.tipoLaborId === tipoLaborId).length

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1">
        <WorkersGrid
          trabajadores={trabajadores}
          registrosDelDia={registros}
          tipoLaborId={tipoLaborId}
          onSeleccionar={manejarSeleccion}
        />
      </div>
      <ProgresoDelDia registrados={registrados} total={trabajadores.length} />
    </main>
  )
}
