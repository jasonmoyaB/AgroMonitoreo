import { MESES } from '../constants/meses.constants'

interface MesGridProps {
  mesSeleccionado: number
  mesMaximo: number
  onSeleccionar: (mes: number) => void
}

const ESTILO_BASE =
  'flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-2xl p-3 text-xl font-black transition-[transform,box-shadow] duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700'

// El mes elegido se pinta relleno y hundido en vez de solo con un borde: el capataz tiene
// que ver de un vistazo cual es, no buscar un anillo fino sobre doce tarjetas iguales.
const ESTILO_SELECCIONADO =
  'cursor-pointer bg-emerald-700 text-white shadow-[inset_5px_5px_10px_rgba(4,47,46,0.5),inset_-5px_-5px_10px_rgba(255,255,255,0.15)]'
const ESTILO_DISPONIBLE =
  'neu-raised cursor-pointer text-slate-800 hover:scale-[1.04] active:neu-pressed active:scale-[0.98]'
const ESTILO_FUTURO = 'neu-raised cursor-not-allowed text-slate-800 opacity-40'

function estiloDelMes(estaSeleccionado: boolean, esFuturo: boolean): string {
  if (esFuturo) return ESTILO_FUTURO
  return estaSeleccionado ? ESTILO_SELECCIONADO : ESTILO_DISPONIBLE
}

export function MesGrid({ mesSeleccionado, mesMaximo, onSeleccionar }: MesGridProps) {
  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-3 p-4 sm:grid-cols-4">
      {MESES.map((mesOpcion) => {
        const estaSeleccionado = mesOpcion.valor === mesSeleccionado
        const esFuturo = mesOpcion.valor > mesMaximo
        return (
          <button
            key={mesOpcion.valor}
            type="button"
            disabled={esFuturo}
            aria-pressed={estaSeleccionado}
            onClick={() => onSeleccionar(mesOpcion.valor)}
            className={`${ESTILO_BASE} ${estiloDelMes(estaSeleccionado, esFuturo)}`}
          >
            {mesOpcion.abreviatura}
          </button>
        )
      })}
    </div>
  )
}
