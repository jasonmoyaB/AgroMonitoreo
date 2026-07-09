import { CircleAlert } from 'lucide-react'

interface AvisoYaRegistradoOverlayProps {
  visible: boolean
  nombreTrabajador: string
  onCerrar: () => void
}

export function AvisoYaRegistradoOverlay({ visible, nombreTrabajador, onCerrar }: AvisoYaRegistradoOverlayProps) {
  if (!visible) return null

  return (
    <div
      role="alertdialog"
      aria-label="Ya registrado hoy"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-amber-600/95 px-6 text-center"
    >
      <CircleAlert className="h-32 w-32 text-white" strokeWidth={3} aria-hidden="true" />
      <p className="text-2xl font-black text-white">{nombreTrabajador}</p>
      <p className="text-xl font-semibold text-white">Ya registrado hoy</p>
      <button
        type="button"
        onClick={onCerrar}
        className="flex min-h-[88px] min-w-[200px] cursor-pointer items-center justify-center rounded-2xl bg-white px-8 text-xl font-black text-amber-700 shadow-lg transition-transform duration-150 active:scale-95"
      >
        Entendido
      </button>
    </div>
  )
}
