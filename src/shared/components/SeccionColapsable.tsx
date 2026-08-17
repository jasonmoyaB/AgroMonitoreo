import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

interface SeccionColapsableProps {
  titulo: string
  descripcion?: string
  children: ReactNode
}

/**
 * Collapse con <details>/<summary> nativo: el navegador maneja abrir/cerrar, el
 * foco, el teclado (Enter/Espacio) y el aria-expanded. Un useState + un div
 * condicional serian mas codigo para reimplementar peor lo mismo.
 *
 * A proposito NO acepta una prop `open`: en cuanto React controla ese atributo,
 * un re-render puede pisar lo que el usuario abrio a mano, y este collapse
 * envuelve un form que re-renderiza en cada tecla. Sin la prop, React nunca
 * toca el atributo y el estado vive solo en el DOM.
 */
export function SeccionColapsable({ titulo, descripcion, children }: SeccionColapsableProps) {
  return (
    <details className="neu-raised group rounded-[2rem] p-5">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-green-900 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-lg font-black text-slate-900">{titulo}</span>
          {descripcion && <span className="mt-1 block font-bold text-slate-600">{descripcion}</span>}
        </span>
        <ChevronDown className="h-6 w-6 shrink-0 text-green-800 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
      </summary>

      {children}
    </details>
  )
}
