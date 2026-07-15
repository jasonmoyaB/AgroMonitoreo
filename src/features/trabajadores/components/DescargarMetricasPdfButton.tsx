import { Download } from 'lucide-react'

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
      className="neu-pressed flex min-h-14 cursor-pointer items-center gap-2 self-start rounded-2xl px-5 font-black text-green-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Download className="h-5 w-5" aria-hidden="true" />
      Descargar PDF
    </button>
  )
}
