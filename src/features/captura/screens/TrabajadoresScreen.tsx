import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { WorkersGrid } from '../components/WorkersGrid'
import { ProgresoDelDia } from '../components/ProgresoDelDia'
import { WizardHeader } from '../components/WizardHeader'
import { AlfabetoIndice } from '../components/AlfabetoIndice'
import { BuscadorTrabajador } from '../components/BuscadorTrabajador'
import { AvisoBloqueoTrabajadorOverlay } from '../components/AvisoBloqueoTrabajadorOverlay'
import { ConfirmarExtraOverlay } from '../components/ConfirmarExtraOverlay'
import { useTrabajadoresPorFinca } from '../hooks/use-trabajadores-por-finca'
import { useRegistrosDelDia } from '../hooks/use-registros-del-dia'
import { useSaltarATrabajador } from '../hooks/use-saltar-a-trabajador'
import { useBusquedaTrabajadores } from '../hooks/use-busqueda-trabajadores'
import { useAusentesDelDia } from '../../asistencia/hooks/use-ausentes-del-dia'
import { useUsuarioActual } from '../../auth/hooks/use-usuario-actual'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { UMBRAL_INDICE_ALFABETO } from '../constants/captura.constants'
import { ordenarTrabajadoresAlfabeticamente } from '../utils/ordenar-trabajadores-alfabeticamente'
import { obtenerIdsRegistradosPorLabor } from '../utils/obtener-ids-registrados'
import type { Trabajador } from '../../../shared/types/domain.types'

const TOTAL_PASOS_CAPTURA = 2
const MENSAJE_AUSENTE = 'El trabajador esta ausente'

type TipoDialogoTrabajador = 'ausente' | 'yaRegistrado'

interface DialogoTrabajador {
  tipo: TipoDialogoTrabajador
  trabajador: Trabajador
}

export function TrabajadoresScreen() {
  const { tipoLaborId = '' } = useParams<{ tipoLaborId: string }>()
  const navigate = useNavigate()
  const fecha = useCapturaSessionStore((state) => state.fecha)
  const [dialogo, setDialogo] = useState<DialogoTrabajador | null>(null)

  const { usuario } = useUsuarioActual()
  const { data: trabajadores = [] } = useTrabajadoresPorFinca(usuario?.fincaId)
  const { data: registros = [] } = useRegistrosDelDia(fecha)
  const { data: ausencias = [] } = useAusentesDelDia(usuario?.fincaId, fecha)
  const tipoLabor = TIPOS_LABOR.find((labor) => labor.id === tipoLaborId)

  const trabajadoresOrdenados = ordenarTrabajadoresAlfabeticamente(trabajadores)
  const { busqueda, setBusqueda, trabajadoresFiltrados } = useBusquedaTrabajadores(trabajadoresOrdenados)
  const saltarATrabajador = useSaltarATrabajador(trabajadoresOrdenados)
  const idsRegistrados = obtenerIdsRegistradosPorLabor(registros, tipoLaborId)
  const idsAusentes = new Set(ausencias.map((ausencia) => ausencia.trabajadorId))

  function manejarSeleccion(trabajador: Trabajador) {
    if (idsAusentes.has(trabajador.id)) {
      setDialogo({ tipo: 'ausente', trabajador })
      return
    }
    if (idsRegistrados.has(trabajador.id)) {
      setDialogo({ tipo: 'yaRegistrado', trabajador })
      return
    }
    navigate(`/captura/labor/${tipoLaborId}/trabajadores/${trabajador.id}`)
  }

  function irACapturarExtra() {
    if (!dialogo) return
    navigate(`/captura/labor/${tipoLaborId}/trabajadores/${dialogo.trabajador.id}`)
    setDialogo(null)
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
        <WorkersGrid
          trabajadores={trabajadoresFiltrados}
          idsRegistrados={idsRegistrados}
          idsAusentes={idsAusentes}
          onSeleccionar={manejarSeleccion}
        />
      </div>
      <ProgresoDelDia registrados={registrados} total={trabajadores.length} />
      <AvisoBloqueoTrabajadorOverlay
        visible={dialogo?.tipo === 'ausente'}
        nombreTrabajador={dialogo?.trabajador.nombreCompleto ?? ''}
        mensaje={MENSAJE_AUSENTE}
        onCerrar={() => setDialogo(null)}
      />
      <ConfirmarExtraOverlay
        visible={dialogo?.tipo === 'yaRegistrado'}
        nombreTrabajador={dialogo?.trabajador.nombreCompleto ?? ''}
        nombreLabor={tipoLabor?.nombre ?? ''}
        onCancelar={() => setDialogo(null)}
        onConfirmar={irACapturarExtra}
      />
    </main>
  )
}
