import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { NumericStepper } from '../../../shared/components/NumericStepper'
import { ConfirmarRegistroButton } from '../components/ConfirmarRegistroButton'
import { ConfirmacionOverlay } from '../components/ConfirmacionOverlay'
import { WizardHeader } from '../../../shared/components/WizardHeader'
import { LaborActualBadge } from '../components/LaborActualBadge'
import { useRegistroDraft } from '../hooks/use-registro-draft'
import { useCrearRegistro } from '../hooks/use-crear-registro'
import { useTrabajadoresDisponibles } from '../hooks/use-trabajadores-disponibles'
import { useRegistrosDelDia } from '../hooks/use-registros-del-dia'
import { useUsuarioActual } from '../../auth/hooks/use-usuario-actual'
import { useFechaCaptura } from '../../../shared/stores/captura-session-store'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { PASO_HORAS, TIEMPO_CONFIRMACION_MS, HORAS_MAXIMAS_POR_DIA, CANTIDAD_MAXIMA_POR_REGISTRO } from '../constants/captura.constants'
import { vibrarConfirmacion } from '../../../shared/lib/vibrate'
import { construirRegistro } from '../utils/construir-registro'
import type { EstadoConfirmacion } from '../types/estado-confirmacion.types'

const TOTAL_PASOS_CAPTURA = 2

export function CapturaRegistroScreen() {
  const { tipoLaborId = '', trabajadorId = '' } = useParams<{ tipoLaborId: string; trabajadorId: string }>()
  const navigate = useNavigate()
  const fecha = useFechaCaptura()
  const [confirmacion, setConfirmacion] = useState<EstadoConfirmacion>('oculto')
  const draftPrecargado = useRef(false)
  const cierreProgramado = useRef<ReturnType<typeof setTimeout>>(undefined)

  const { usuario } = useUsuarioActual()
  // RouteGuard ya frena al supervisor sin finca, pero los hooks piden string | undefined
  const fincaId = usuario?.fincaId ?? undefined
  const { data: trabajadores = [] } = useTrabajadoresDisponibles(fincaId, fecha)
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

  // Un solo cierre por pantalla: si la conexion vuelve dentro del segundo del overlay, la
  // mutacion se reanuda y `onSuccess` querria confirmar de nuevo — dos vibraciones, el overlay
  // saltando de ambar a verde y dos `navigate`, el segundo ya sobre la grid.
  function cerrarConConfirmacion(estado: EstadoConfirmacion) {
    if (cierreProgramado.current !== undefined) return
    vibrarConfirmacion()
    limpiarDraft()
    setConfirmacion(estado)
    cierreProgramado.current = setTimeout(() => navigate(`/captura/labor/${tipoLaborId}/trabajadores`), TIEMPO_CONFIRMACION_MS)
  }

  useEffect(() => () => clearTimeout(cierreProgramado.current), [])

  // Sin señal la mutacion queda pausada y `onSuccess` no corre nunca: sin esto el capataz
  // toca Confirmar y la pantalla no reacciona, que es como se perdian los registros.
  const quedoPendiente = crearRegistro.isPaused
  useEffect(() => {
    if (quedoPendiente) cerrarConConfirmacion('pendiente')
    // cerrarConConfirmacion se recrea en cada render; listarla haria correr el efecto siempre
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [quedoPendiente])

  if (!tipoLabor || !trabajador || !fincaId) return null

  function confirmarRegistro() {
    if (!tipoLabor || !fincaId) return
    const registro = construirRegistro({
      fincaId,
      trabajadorId,
      tipoLabor,
      fecha,
      horas: draft.horas,
      cantidad: draft.cantidad,
    })
    crearRegistro.mutate(registro, { onSuccess: () => cerrarConConfirmacion('enviado') })
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
      <ConfirmacionOverlay estado={confirmacion} />
    </main>
  )
}
