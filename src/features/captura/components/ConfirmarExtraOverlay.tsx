import { useEffect, useRef } from 'react'
import { CircleCheckBig } from 'lucide-react'

interface ConfirmarExtraOverlayProps {
  visible: boolean
  nombreTrabajador: string
  nombreLabor: string
  onCancelar: () => void
  onConfirmar: () => void
}

export function ConfirmarExtraOverlay({ visible, nombreTrabajador, nombreLabor, onCancelar, onConfirmar }: ConfirmarExtraOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (visible) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [visible])

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-label={`${nombreTrabajador} ya registro ${nombreLabor}, agregar extra`}
      className="m-0 h-full max-h-none w-full max-w-none border-0 bg-sky-600/95 p-0 open:flex flex-col items-center justify-center gap-6 px-6 text-center backdrop:bg-black/50"
    >
      <CircleCheckBig className="h-32 w-32 text-white" strokeWidth={3} aria-hidden="true" />
      <p className="text-2xl font-black text-white">{nombreTrabajador}</p>
      <p className="text-xl font-semibold text-white">Ya registró {nombreLabor} hoy</p>
      <p className="text-lg font-semibold text-white/90">¿Deseas agregar extra?</p>
      <div className="flex w-full max-w-md gap-4">
        <button
          type="button"
          onClick={onCancelar}
          className="flex min-h-[88px] flex-1 cursor-pointer items-center justify-center rounded-2xl bg-white/20 px-6 text-xl font-black text-white shadow-lg transition-transform duration-150 active:scale-95"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirmar}
          className="flex min-h-[88px] flex-1 cursor-pointer items-center justify-center rounded-2xl bg-white px-6 text-xl font-black text-sky-700 shadow-lg transition-transform duration-150 active:scale-95"
        >
          Agregar extra
        </button>
      </div>
    </dialog>
  )
}
