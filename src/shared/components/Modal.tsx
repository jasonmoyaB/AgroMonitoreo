import { useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  children: React.ReactNode
  size?: ModalSize
}

export function Modal({ isOpen, title, onClose, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-3 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className={`neu-raised max-h-full w-full overflow-y-auto rounded-[2rem] p-5 sm:p-6 ${MAX_WIDTH_POR_TAMANO[size]}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-600 transition-colors duration-200 hover:bg-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
