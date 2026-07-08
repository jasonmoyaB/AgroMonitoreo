import { CircleCheckBig } from 'lucide-react'

interface ConfirmacionOverlayProps {
  visible: boolean
}

export function ConfirmacionOverlay({ visible }: ConfirmacionOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-emerald-600/90 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <CircleCheckBig className="h-40 w-40 text-white" strokeWidth={3} aria-hidden="true" />
    </div>
  )
}
