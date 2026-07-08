import { create } from 'zustand'
import type { Toast } from '../types/toast.types'

interface ToastState {
  toasts: Toast[]
  mostrarToast: (toast: Omit<Toast, 'id'>) => void
  descartarToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  mostrarToast: (toast) =>
    set((state) => ({ toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }] })),
  descartarToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))
