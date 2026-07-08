import { create } from 'zustand'

interface CapturaSessionState {
  tipoLaborId: string | null
  fecha: string
  seleccionarLabor: (tipoLaborId: string) => void
  reiniciar: () => void
}

function obtenerFechaDeHoy(): string {
  return new Date().toISOString().slice(0, 10)
}

export const useCapturaSessionStore = create<CapturaSessionState>((set) => ({
  tipoLaborId: null,
  fecha: obtenerFechaDeHoy(),
  seleccionarLabor: (tipoLaborId) => set({ tipoLaborId }),
  reiniciar: () => set({ tipoLaborId: null, fecha: obtenerFechaDeHoy() }),
}))
