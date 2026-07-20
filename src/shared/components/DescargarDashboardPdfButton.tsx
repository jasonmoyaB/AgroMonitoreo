import { Download } from 'lucide-react'

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
      className="neu-pressed flex min-h-14 shrink-0 cursor-pointer items-center gap-2 rounded-2xl px-5 font-black text-green-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 disabled:cursor-wait disabled:opacity-60"
    >
      <Download className="h-5 w-5" aria-hidden="true" />
      {isDownloading ? 'Descargando...' : 'Descargar PDF'}
    </button>
  )
}
