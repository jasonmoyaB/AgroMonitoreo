import { useEffect } from 'react'
import { TOAST_DURATION_MS } from '../constants/toast.constants'
import { useToastStore } from '../stores/toast-store'
import type { Toast as ToastData } from '../types/toast.types'

interface ToastProps {
  toast: ToastData
}

export function Toast({ toast }: ToastProps) {
  const descartarToast = useToastStore((state) => state.descartarToast)

  useEffect(() => {
    const timer = setTimeout(() => descartarToast(toast.id), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast.id, descartarToast])

  const toneClass = toast.type === 'success' ? 'bg-green-700' : 'bg-red-700'

  return (
    <div role="status" className={`animate-toast-pop pointer-events-auto min-w-64 max-w-sm rounded-2xl px-5 py-4 text-white shadow-xl ${toneClass}`}>
      <p className="font-black">{toast.title}</p>
      {toast.description && <p className="text-sm font-semibold opacity-90">{toast.description}</p>}
    </div>
  )
}
