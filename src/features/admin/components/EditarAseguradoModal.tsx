import { Modal } from '../../../shared/components/Modal'
import type { Trabajador } from '../../../shared/types/domain.types'

interface EditarAseguradoModalProps {
  trabajador: Trabajador | null
  isGuardando: boolean
  onCambiar: (asegurado: boolean) => void
  onClose: () => void
}

export function EditarAseguradoModal({ trabajador, isGuardando, onCambiar, onClose }: EditarAseguradoModalProps) {
  return (
    <Modal isOpen={trabajador !== null} title={trabajador?.nombreCompleto ?? ''} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="font-bold leading-7 text-slate-600">¿Está inscrito ante la CCSS?</p>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Seguro del trabajador">
          <button
            type="button"
            aria-pressed={trabajador?.asegurado === true}
            disabled={isGuardando}
            onClick={() => onCambiar(true)}
            className={crearSeguroClass(trabajador?.asegurado === true)}
          >
            Asegurado
          </button>
          <button
            type="button"
            aria-pressed={trabajador?.asegurado === false}
            disabled={isGuardando}
            onClick={() => onCambiar(false)}
            className={crearSeguroClass(trabajador?.asegurado === false)}
          >
            No asegurado
          </button>
        </div>
      </div>
    </Modal>
  )
}

function crearSeguroClass(isSelected: boolean) {
  const selectedClass = isSelected ? 'bg-green-700 text-white shadow-lg shadow-green-900/20' : 'neu-pressed text-slate-700'
  return `min-h-14 cursor-pointer rounded-2xl px-4 text-lg font-black disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 ${selectedClass}`
}
