import { fechaLocalIso } from '../../../shared/utils/fecha-local'
import type { TrabajadorOtraFinca } from '../types/traslado.types'

interface SolicitarTrasladoTrabajadoresStepState {
  trabajadores: readonly TrabajadorOtraFinca[]
  fecha: string
  seleccionados: ReadonlySet<string>
  isSubmitting: boolean
}

interface SolicitarTrasladoTrabajadoresStepActions {
  onFechaChange: (fecha: string) => void
  onToggleTrabajador: (trabajadorId: string) => void
  onSubmit: () => void
}

interface SolicitarTrasladoTrabajadoresStepProps {
  state: SolicitarTrasladoTrabajadoresStepState
  actions: SolicitarTrasladoTrabajadoresStepActions
}

export function SolicitarTrasladoTrabajadoresStep({ state, actions }: SolicitarTrasladoTrabajadoresStepProps) {
  const { trabajadores, fecha, seleccionados, isSubmitting } = state
  // en el render y no a nivel de modulo: la PWA queda abierta de un dia para otro y
  // un minimo congelado dejaba pedir traslados para fechas ya pasadas
  const fechaMinima = fechaLocalIso()

  return (
    <div className="neu-raised flex flex-col gap-4 rounded-[2rem] p-5">
      <label className="flex flex-col gap-2 font-black text-slate-800">
        Día del préstamo
        <input
          type="date"
          value={fecha}
          min={fechaMinima}
          onChange={(event) => actions.onFechaChange(event.target.value)}
          className="neu-pressed min-h-16 rounded-2xl px-4 text-xl font-black text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
        />
      </label>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">Trabajadores</p>
        {trabajadores.map((trabajador) => (
          <label
            key={trabajador.id}
            className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl px-4 font-black text-slate-900 transition-colors duration-200 ${
              seleccionados.has(trabajador.id) ? 'neu-pressed' : 'bg-white/40 hover:bg-white/70'
            }`}
          >
            <input
              type="checkbox"
              checked={seleccionados.has(trabajador.id)}
              onChange={() => actions.onToggleTrabajador(trabajador.id)}
              className="h-5 w-5 shrink-0 accent-green-700"
            />
            {trabajador.nombreCompleto}
          </label>
        ))}
      </div>

      <button
        type="button"
        disabled={isSubmitting || seleccionados.size === 0}
        onClick={actions.onSubmit}
        className="min-h-16 cursor-pointer rounded-2xl bg-green-700 px-5 text-xl font-black text-white shadow-lg shadow-green-900/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Enviando' : `Mandar permiso (${seleccionados.size})`}
      </button>
    </div>
  )
}
