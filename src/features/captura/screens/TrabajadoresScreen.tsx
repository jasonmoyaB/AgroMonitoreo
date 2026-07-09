import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { WorkersGrid } from '../components/WorkersGrid'
import { ProgresoDelDia } from '../components/ProgresoDelDia'
import { WizardHeader } from '../components/WizardHeader'
import { AlfabetoIndice } from '../components/AlfabetoIndice'
import { BuscadorTrabajador } from '../components/BuscadorTrabajador'
import { AvisoYaRegistradoOverlay } from '../components/AvisoYaRegistradoOverlay'
import { useTrabajadoresPorFinca } from '../hooks/use-trabajadores-por-finca'
import { useRegistrosDelDia } from '../hooks/use-registros-del-dia'
import { useSaltarATrabajador } from '../hooks/use-saltar-a-trabajador'
import { useBusquedaTrabajadores } from '../hooks/use-busqueda-trabajadores'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { UMBRAL_INDICE_ALFABETO } from '../constants/captura.constants'
import { ordenarTrabajadoresAlfabeticamente } from '../utils/ordenar-trabajadores-alfabeticamente'
import { obtenerIdsRegistradosPorLabor } from '../utils/obtener-ids-registrados'
import type { Trabajador } from '../../../shared/types/domain.types'

const TOTAL_PASOS_CAPTURA = 2

export function TrabajadoresScreen() {
  const { tipoLaborId = '' } = useParams<{ tipoLaborId: string }>()
  const navigate = useNavigate()
  const fecha = useCapturaSessionStore((state) => state.fecha)
  const [trabajadorBloqueado, setTrabajadorBloqueado] = useState<Trabajador | null>(null)

  const { data: trabajadores = [] } = useTrabajadoresPorFinca(FINCA_ACTUAL.id)
  const { data: registros = [] } = useRegistrosDelDia(fecha)
  const tipoLabor = TIPOS_LABOR.find((labor) => labor.id === tipoLaborId)

  const trabajadoresOrdenados = ordenarTrabajadoresAlfabeticamente(trabajadores)
  const { busqueda, setBusqueda, trabajadoresFiltrados } = useBusquedaTrabajadores(trabajadoresOrdenados)
  const saltarATrabajador = useSaltarATrabajador(trabajadoresOrdenados)
  const idsRegistrados = obtenerIdsRegistradosPorLabor(registros, tipoLaborId)

  function manejarSeleccion(trabajador: Trabajador) {
    if (idsRegistrados.has(trabajador.id)) {
      setTrabajadorBloqueado(trabajador)
      return
    }
    navigate(`/captura/labor/${tipoLaborId}/trabajadores/${trabajador.id}`)
  }

  const registrados = registros.filter((registro) => registro.tipoLaborId === tipoLaborId).length
  const mostrarIndiceAlfabeto = !busqueda && trabajadoresOrdenados.length > UMBRAL_INDICE_ALFABETO

  return (
    <main className="flex min-h-screen flex-col">
      <WizardHeader
        paso={1}
        totalPasos={TOTAL_PASOS_CAPTURA}
        titulo={tipoLabor?.nombre ?? 'Trabajadores'}
        onAtras={() => navigate('/supervisor')}
      />
      <div className="flex flex-col gap-3 py-2">
        <BuscadorTrabajador valor={busqueda} onChange={setBusqueda} />
        {mostrarIndiceAlfabeto && <AlfabetoIndice onSeleccionarRango={saltarATrabajador} />}
      </div>
      <div className="flex-1">
        <WorkersGrid trabajadores={trabajadoresFiltrados} idsRegistrados={idsRegistrados} onSeleccionar={manejarSeleccion} />
      </div>
      <ProgresoDelDia registrados={registrados} total={trabajadores.length} />
      <AvisoYaRegistradoOverlay
        visible={trabajadorBloqueado !== null}
        nombreTrabajador={trabajadorBloqueado?.nombreCompleto ?? ''}
        onCerrar={() => setTrabajadorBloqueado(null)}
      />
    </main>
  )
}
