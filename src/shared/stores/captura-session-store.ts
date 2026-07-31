import { create } from 'zustand'
import { fechaLocalIso } from '../utils/fecha-local'

interface CapturaSessionState {
  tipoLaborId: string | null
  fecha: string
  seleccionarLabor: (tipoLaborId: string) => void
  establecerFecha: (fecha: string) => void
  reiniciar: () => void
}

function obtenerFechaDeHoy(): string {
  return fechaLocalIso()
}

export const useCapturaSessionStore = create<CapturaSessionState>((set) => ({
  tipoLaborId: null,
  fecha: obtenerFechaDeHoy(),
  seleccionarLabor: (tipoLaborId) => set({ tipoLaborId }),
  establecerFecha: (fecha) => set({ fecha }),
  reiniciar: () => set({ tipoLaborId: null, fecha: obtenerFechaDeHoy() }),
}))
