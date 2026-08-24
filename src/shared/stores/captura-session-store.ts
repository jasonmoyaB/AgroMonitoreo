import { create } from 'zustand'
import { fechaLocalIso } from '../utils/fecha-local'

interface CapturaSessionState {
  tipoLaborId: string | null
  fecha: string | null
  seleccionarLabor: (tipoLaborId: string) => void
  establecerFecha: (fecha: string) => void
  reiniciar: () => void
}

// `fecha` arranca en null a proposito: null significa "el capataz no eligio ninguna", no
// "hoy". Guardar el ISO de hoy lo congelaba al cargar el modulo, y la PWA de campo queda
// instalada dias — al otro dia seguia escribiendo con la fecha vieja, que el upsert de
// registros_trabajo no rechaza sino que pisa.
export const useCapturaSessionStore = create<CapturaSessionState>((set) => ({
  tipoLaborId: null,
  fecha: null,
  seleccionarLabor: (tipoLaborId) => set({ tipoLaborId }),
  establecerFecha: (fecha) => set({ fecha }),
  reiniciar: () => set({ tipoLaborId: null, fecha: null }),
}))

export function useFechaCaptura(): string {
  return useCapturaSessionStore((state) => state.fecha) ?? fechaLocalIso()
}
