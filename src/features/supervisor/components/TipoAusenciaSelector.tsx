import { TIPOS_AUSENCIA } from '../../asistencia/constants/tipos-ausencia.constants'
import type { TipoAusencia } from '../../../shared/types/domain.types'
import { TipoAusenciaIcon } from './TipoAusenciaIcon'

interface TipoAusenciaSelectorProps {
  tipo: TipoAusencia
  onSeleccionar: (tipo: TipoAusencia) => void
}

export function TipoAusenciaSelector({ tipo, onSeleccionar }: TipoAusenciaSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-black text-slate-600">¿Que tipo de ausencia sera?</p>
      <div className="grid grid-cols-3 gap-2">
        {TIPOS_AUSENCIA.map((opcion) => (
          <BotonTipoAusencia key={opcion.id} id={opcion.id} nombre={opcion.nombre} seleccionado={opcion.id === tipo} onClick={() => onSeleccionar(opcion.id)} />
        ))}
      </div>
    </div>
  )
}

interface BotonTipoAusenciaProps {
  id: TipoAusencia
  nombre: string
  seleccionado: boolean
  onClick: () => void
}

function BotonTipoAusencia({ id, nombre, seleccionado, onClick }: BotonTipoAusenciaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={seleccionado}
      className={`flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl p-2 text-center text-xs font-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 ${seleccionado ? 'bg-green-700 text-white shadow-lg shadow-green-900/20' : 'bg-white/60 text-slate-800 hover:bg-white'}`}
    >
      <TipoAusenciaIcon tipo={id} className="h-6 w-6" />
      {nombre}
    </button>
  )
}
