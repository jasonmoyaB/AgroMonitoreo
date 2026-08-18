import { Download } from 'lucide-react'
import { BOTON_SECUNDARIO } from '../constants/botones.constants'

interface DescargarDashboardPdfButtonProps {
  isDownloading: boolean
  onDescargar: () => void
}

export function DescargarDashboardPdfButton({ isDownloading, onDescargar }: DescargarDashboardPdfButtonProps) {
  return (
    <button
      type="button"
      onClick={onDescargar}
      disabled={isDownloading}
      className={`${BOTON_SECUNDARIO} shrink-0`}
    >
      <Download className="h-5 w-5" aria-hidden="true" />
      {isDownloading ? 'Descargando...' : 'Descargar PDF'}
    </button>
  )
}
