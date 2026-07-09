import { useEffect, useRef, useEffectEvent, type MouseEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'

export type ModalSize = 'md' | 'lg'

const MAX_WIDTH_POR_TAMANO: Record<ModalSize, string> = {
  md: 'max-w-lg',
  lg: 'max-w-5xl',
}

interface ModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  size?: ModalSize
}

export function Modal({ isOpen, title, onClose, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const notifyClose = useEffectEvent(onClose)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    function handleNativeClose() {
      notifyClose()
    }
    dialog.addEventListener('close', handleNativeClose)
    return () => dialog.removeEventListener('close', handleNativeClose)
  }, [])

  function cerrarSiClickEnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onClick={cerrarSiClickEnBackdrop}
      className="m-4 max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] rounded-[2rem] border-none bg-transparent p-0 backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm sm:m-6 sm:w-[calc(100%-3rem)]"
    >
      {isOpen && (
        <div className={`neu-raised mx-auto max-h-full overflow-y-auto rounded-[2rem] p-5 sm:p-6 ${MAX_WIDTH_POR_TAMANO[size]}`}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 className="text-2xl font-black text-slate-900">{title}</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar"
              className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-600 transition-colors duration-200 hover:bg-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
