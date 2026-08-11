import { Modal } from '../../../shared/components/Modal'
import { formatearFechaIsoDdMmAaaa } from '../../../shared/utils/fecha-iso'
import { formatearMonto } from '../../../shared/utils/formatear-monto'
import { formatearTipoAusencia } from '../../asistencia/utils/formatear-tipo-ausencia'
import type { FilaPlanilla } from '../../planilla/types/planilla.types'

interface AusenciasQuincenaModalProps {
  fila: FilaPlanilla | null
  onClose: () => void
}

// muestra las ausencias vivas del rango, no las del snapshot del pago: pagos_quincenales
// congela cuantos dias fueron, no cuales
export function AusenciasQuincenaModal({ fila, onClose }: AusenciasQuincenaModalProps) {
  const deduccion = fila === null ? 0 : fila.montoQuincena - fila.montoNeto

  return (
    <Modal isOpen={fila !== null} title={fila === null ? 'Ausencias' : `Ausencias de ${fila.nombreCompleto}`} onClose={onClose}>
      {fila !== null && (
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-2">
            {fila.ausencias.map((ausencia) => (
              <li key={ausencia.fecha} className="neu-pressed flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3">
                <span className="font-black text-slate-900">{formatearFechaIsoDdMmAaaa(ausencia.fecha)}</span>
                <span className="font-bold text-slate-600">{formatearTipoAusencia(ausencia.tipo)}</span>
              </li>
            ))}
          </ul>
          <p className="font-bold leading-6 text-slate-600">
            {fila.ausencias.length} {fila.ausencias.length === 1 ? 'día' : 'días'} × valor hora × 8 ={' '}
            <span className="font-black text-amber-700">−{formatearMonto(deduccion, fila.moneda)}</span>
          </p>
        </div>
      )}
    </Modal>
  )
}
