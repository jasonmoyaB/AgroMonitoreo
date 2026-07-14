import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { NumericStepper } from '../../../shared/components/NumericStepper'
import { ConfirmarRegistroButton } from '../components/ConfirmarRegistroButton'
import { ConfirmacionOverlay } from '../components/ConfirmacionOverlay'
import { WizardHeader } from '../components/WizardHeader'
import { LaborActualBadge } from '../components/LaborActualBadge'
import { useRegistroDraft } from '../hooks/use-registro-draft'
import { useCrearRegistro } from '../hooks/use-crear-registro'
import { useTrabajadoresPorFinca } from '../hooks/use-trabajadores-por-finca'
import { useRegistrosDelDia } from '../hooks/use-registros-del-dia'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { PASO_HORAS, TIEMPO_CONFIRMACION_MS, HORAS_MAXIMAS_POR_DIA, CANTIDAD_MAXIMA_POR_REGISTRO } from '../constants/captura.constants'
import { vibrarConfirmacion } from '../../../shared/lib/vibrate'
import { construirRegistro } from '../utils/construir-registro'

const TOTAL_PASOS_CAPTURA = 2

export function CapturaRegistroScreen() {
  const { tipoLaborId = '', trabajadorId = '' } = useParams<{ tipoLaborId: string; trabajadorId: string }>()
  const navigate = useNavigate()
  const fecha = useCapturaSessionStore((state) => state.fecha)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const draftPrecargado = useRef(false)

  const { data: trabajadores = [] } = useTrabajadoresPorFinca(FINCA_ACTUAL.id)
  const { data: registros = [] } = useRegistrosDelDia(fecha)
  const crearRegistro = useCrearRegistro()
  const { draft, setDraft, limpiarDraft, cargado } = useRegistroDraft(trabajadorId, tipoLaborId, fecha)

  const tipoLabor = TIPOS_LABOR.find((labor) => labor.id === tipoLaborId)
  const trabajador = trabajadores.find((persona) => persona.id === trabajadorId)
  const registroExistente = registros.find(
    (registro) => registro.trabajadorId === trabajadorId && registro.tipoLaborId === tipoLaborId
  )

  useEffect(() => {
    if (!cargado || !registroExistente || draftPrecargado.current) return
    draftPrecargado.current = true
    // Solo pisa el borrador local si sigue en su valor inicial (0/0 = nada sin enviar todavia).
    if (draft.horas === 0 && draft.cantidad === 0) {
      setDraft({ horas: registroExistente.horas, cantidad: registroExistente.cantidad ?? 0 })
    }
  }, [cargado, registroExistente, draft, setDraft])

  if (!tipoLabor || !trabajador) return null

  function manejarExito() {
    vibrarConfirmacion()
    limpiarDraft()
    setMostrarConfirmacion(true)
    setTimeout(() => {
      setMostrarConfirmacion(false)
      navigate(`/captura/labor/${tipoLaborId}/trabajadores`)
    }, TIEMPO_CONFIRMACION_MS)
  }

  function confirmarRegistro() {
    if (!tipoLabor) return
    const registro = construirRegistro({
      fincaId: FINCA_ACTUAL.id,
      trabajadorId,
      tipoLabor,
      fecha,
      horas: draft.horas,
      cantidad: draft.cantidad,
    })
    crearRegistro.mutate(registro, { onSuccess: manejarExito })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between gap-6 p-6">
      <WizardHeader
        paso={2}
        totalPasos={TOTAL_PASOS_CAPTURA}
        titulo={trabajador.nombreCompleto}
        onAtras={() => navigate(`/captura/labor/${tipoLaborId}/trabajadores`)}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-10">
        <NumericStepper
          label="Horas"
          value={draft.horas}
          step={PASO_HORAS}
          rango={{ min: 0, max: HORAS_MAXIMAS_POR_DIA }}
          onChange={(horas) => setDraft({ ...draft, horas })}
        />
        {tipoLabor.tieneCantidad && (
          <NumericStepper
            label={tipoLabor.unidadMedida ?? 'Cantidad'}
            value={draft.cantidad}
            step={tipoLabor.pasoCantidad}
            rango={{ min: 0, max: CANTIDAD_MAXIMA_POR_REGISTRO }}
            onChange={(cantidad) => setDraft({ ...draft, cantidad })}
          />
        )}
      </div>
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <LaborActualBadge icono={tipoLabor.icono} nombre={tipoLabor.nombre} color={tipoLabor.color} />
        <ConfirmarRegistroButton
          onClick={confirmarRegistro}
          disabled={crearRegistro.isPending}
          texto={registroExistente ? 'Guardar cambios' : 'Confirmar'}
        />
      </div>
      <ConfirmacionOverlay visible={mostrarConfirmacion} />
    </main>
  )
}
