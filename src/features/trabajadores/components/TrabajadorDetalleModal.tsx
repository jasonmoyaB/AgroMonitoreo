import { Avatar } from '../../../shared/components/Avatar'
import { Modal } from '../../../shared/components/Modal'
import { formatearFechaIsoDdMmAaaa } from '../../../shared/utils/fecha-iso'
import type { Trabajador } from '../../../shared/types/domain.types'

const AVATAR_SIZE_PX = 64
const SIN_DATO = 'Sin registrar'

interface TrabajadorDetalleModalProps {
  trabajador: Trabajador | null
  onClose: () => void
}

export function TrabajadorDetalleModal({ trabajador, onClose }: TrabajadorDetalleModalProps) {
  return (
    <Modal isOpen={trabajador !== null} title="Datos del trabajador" onClose={onClose}>
      {trabajador && (
        <div className="flex flex-col gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar nombre={trabajador.nombreCompleto} fotoUrl={trabajador.fotoUrl} size={AVATAR_SIZE_PX} />
            <div className="min-w-0">
              <p className="truncate text-xl font-black text-slate-900">{trabajador.nombreCompleto}</p>
              <p className="text-sm font-bold text-slate-600">
                {trabajador.activo ? 'Activo' : 'Inactivo'} · {trabajador.asegurado ? 'Asegurado' : 'No asegurado'}
              </p>
            </div>
          </div>

          <dl className="flex flex-col gap-2">
            <DatoTrabajador etiqueta="Cédula" valor={trabajador.cedula} />
            <DatoTrabajador etiqueta="Fecha de ingreso" valor={trabajador.fechaIngreso ? formatearFechaIsoDdMmAaaa(trabajador.fechaIngreso) : null} />
            <DatoTrabajador etiqueta="Teléfono" valor={trabajador.telefono} />
          </dl>
        </div>
      )}
    </Modal>
  )
}

interface DatoTrabajadorProps {
  etiqueta: string
  valor: string | null
}

function DatoTrabajador({ etiqueta, valor }: DatoTrabajadorProps) {
  return (
    <div className="neu-well flex flex-wrap items-baseline justify-between gap-2 rounded-2xl px-4 py-3">
      <dt className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">{etiqueta}</dt>
      <dd className={`text-base font-black ${valor ? 'text-slate-900' : 'text-slate-400'}`}>{valor || SIN_DATO}</dd>
    </div>
  )
}
