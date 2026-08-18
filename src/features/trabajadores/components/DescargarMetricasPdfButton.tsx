import { Download } from 'lucide-react'
import { BOTON_SECUNDARIO } from '../../../shared/constants/botones.constants'

interface DescargarMetricasPdfButtonProps {
  disabled: boolean
  onDescargar: () => void
}

export function DescargarMetricasPdfButton({ disabled, onDescargar }: DescargarMetricasPdfButtonProps) {
  return (
    <button
      type="button"
      onClick={onDescargar}
      disabled={disabled}
      className={`${BOTON_SECUNDARIO} self-start`}
    >
      <Download className="h-5 w-5" aria-hidden="true" />
      Descargar PDF
    </button>
  )
}
