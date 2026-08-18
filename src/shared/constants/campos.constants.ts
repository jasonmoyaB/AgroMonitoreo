import { FOCO_ANILLO } from './botones.constants'

// Campo de texto neumorfico. Vivia dentro de CampoTexto.tsx, pero una constante en un
// archivo de componente obliga a TrabajadorForm a importar de componente a componente
// solo para traerse un string.
export const INPUT_NEU_CLASS = `neu-pressed min-h-16 rounded-2xl px-4 text-xl font-black text-slate-900 outline-none ${FOCO_ANILLO}`
