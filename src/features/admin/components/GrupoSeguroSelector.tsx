import { OPCIONES_GRUPO_SEGURO } from '../../planilla/constants/seguro.constants'
import type { GrupoSeguro } from '../../planilla/types/planilla.types'

interface GrupoSeguroSelectorProps {
  grupo: GrupoSeguro
  onGrupoChange: (grupo: GrupoSeguro) => void
}

export function GrupoSeguroSelector({ grupo, onGrupoChange }: GrupoSeguroSelectorProps) {
  return (
    <div className="mb-4 grid gap-2 sm:grid-cols-2" role="group" aria-label="Grupo de trabajadores a pagar">
      {OPCIONES_GRUPO_SEGURO.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          aria-pressed={grupo === opcion.valor}
          onClick={() => onGrupoChange(opcion.valor)}
          className={crearGrupoClass(grupo === opcion.valor)}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  )
}

// no usa crearClaseToggle: sin seleccionar va neu-raised, no neu-pressed. son dos botones
// elevados sobre el fondo, no un par hundido dentro de un formulario
function crearGrupoClass(isSelected: boolean) {
  const selectedClass = isSelected ? 'bg-green-700 text-white shadow-lg shadow-green-900/20' : 'neu-raised text-slate-700'
  return `min-h-14 cursor-pointer rounded-2xl px-4 font-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 ${selectedClass}`
}
