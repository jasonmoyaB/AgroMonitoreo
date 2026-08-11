const BASE = 'min-h-14 cursor-pointer rounded-2xl px-4 font-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900'
const SELECCIONADO = 'bg-green-700 text-white shadow-lg shadow-green-900/20'
const NO_SELECCIONADO = 'neu-pressed text-slate-700'

// los pares de botones que hacen de toggle (activo/inactivo, asegurado/no asegurado,
// filtros de estado). extra lleva lo que cambia por sitio: tamano de texto, disabled
export function crearClaseToggle(isSelected: boolean, extra = ''): string {
  return `${BASE} ${isSelected ? SELECCIONADO : NO_SELECCIONADO} ${extra}`
}
