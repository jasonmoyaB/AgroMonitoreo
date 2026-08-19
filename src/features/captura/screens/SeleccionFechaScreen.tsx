import { CalendarCheck } from 'lucide-react'
import { WizardHeader } from '../../../shared/components/WizardHeader'
import { NumericStepper } from '../../../shared/components/NumericStepper'
import { ConfirmarRegistroButton } from '../components/ConfirmarRegistroButton'
import { MesGrid } from '../components/MesGrid'
import { useSeleccionFecha } from '../hooks/use-seleccion-fecha'
import { ANIO_MINIMO } from '../constants/captura.constants'

const TOTAL_PASOS_FECHA = 1

export function SeleccionFechaScreen() {
  const seleccion = useSeleccionFecha()

  return (
    <main className="flex min-h-screen flex-col">
      <WizardHeader paso={TOTAL_PASOS_FECHA} totalPasos={TOTAL_PASOS_FECHA} titulo="¿Qué fecha?" onAtras={seleccion.volver} />
      <div className="flex flex-wrap items-start justify-center gap-8 px-4 py-2">
        <NumericStepper
          label="Año"
          value={seleccion.fecha.anio}
          step={1}
          rango={{ min: ANIO_MINIMO, max: seleccion.anioMaximo }}
          onChange={seleccion.seleccionarAnio}
        />
        <NumericStepper
          label="Día"
          value={seleccion.fecha.dia}
          step={1}
          rango={{ min: 1, max: seleccion.diaMaximo }}
          onChange={seleccion.seleccionarDia}
        />
      </div>
      <MesGrid mesSeleccionado={seleccion.fecha.mes} mesMaximo={seleccion.mesMaximo} onSeleccionar={seleccion.seleccionarMes} />
      <div className="neu-raised sticky bottom-0 mt-auto rounded-t-3xl p-4">
        <div className="mx-auto flex w-full max-w-md items-stretch gap-3">
          <button
            type="button"
            onClick={seleccion.irAHoy}
            disabled={seleccion.esHoy}
            className="neu-raised flex min-h-[88px] shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl px-6 text-xl font-black text-slate-700 transition-[transform,box-shadow,opacity] duration-150 active:neu-pressed active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          >
            <CalendarCheck className="h-8 w-8 text-green-800" aria-hidden="true" />
            Hoy
          </button>
          <div className="flex-1">
            <ConfirmarRegistroButton onClick={seleccion.aceptar} texto="Aceptar" />
          </div>
        </div>
      </div>
    </main>
  )
}
