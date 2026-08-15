import type { ReactNode } from 'react'
import { Eye } from 'lucide-react'
import { Avatar } from '../../../shared/components/Avatar'
import { BOTON_ACTIVAR, BOTON_DESACTIVAR, BOTON_EDITAR, BOTON_TABLA, BOTON_VER } from '../../../shared/constants/botones-tabla.constants'
import type { Trabajador } from '../../../shared/types/domain.types'

const AVATAR_SIZE_PX = 40
const BADGE_CLASS = 'inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black uppercase tracking-wide'

interface TrabajadoresTableActions {
  onVer: (trabajador: Trabajador) => void
  onEdit: (trabajador: Trabajador) => void
  onToggleActive: (trabajador: Trabajador) => void
  onSelectTrabajador: (trabajador: Trabajador) => void
}

interface TrabajadoresTableProps {
  trabajadores: readonly Trabajador[]
  isLoading: boolean
  fincaDestinoPorTrasladado: ReadonlyMap<string, string>
  actions: TrabajadoresTableActions
}

export function TrabajadoresTable({ trabajadores, isLoading, fincaDestinoPorTrasladado, actions }: TrabajadoresTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando trabajadores.</p>
  if (!trabajadores.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">No se encontraron trabajadores.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-900/10">
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Trabajador
              </th>
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Estado
              </th>
              <th scope="col" className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {trabajadores.map((trabajador) => (
              <TrabajadoresTableRow
                key={trabajador.id}
                trabajador={trabajador}
                fincaDestino={fincaDestinoPorTrasladado.get(trabajador.id) ?? null}
                actions={actions}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface TrabajadoresTableRowProps {
  trabajador: Trabajador
  fincaDestino: string | null
  actions: TrabajadoresTableActions
}

function TrabajadoresTableRow({ trabajador, fincaDestino, actions }: TrabajadoresTableRowProps) {
  return (
    <tr className="border-b border-slate-900/5 last:border-b-0 hover:bg-white/45">
      <td className="px-5 py-3">
        {/* el nombre abre las metricas: un onClick en el <tr> no lo alcanza el teclado */}
        <button type="button" onClick={() => actions.onSelectTrabajador(trabajador)} className="flex min-w-0 cursor-pointer items-center gap-3 text-left">
          <Avatar nombre={trabajador.nombreCompleto} fotoUrl={trabajador.fotoUrl} size={AVATAR_SIZE_PX} />
          <span className="truncate text-base font-black text-slate-900 underline decoration-slate-900/20 underline-offset-4">{trabajador.nombreCompleto}</span>
        </button>
      </td>
      <td className="px-5 py-3">
        <div className="flex flex-wrap gap-1.5">
          <span className={`${BADGE_CLASS} ${trabajador.activo ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
            {trabajador.activo ? 'Activo' : 'Inactivo'}
          </span>
          <span className={`${BADGE_CLASS} ${trabajador.asegurado ? 'bg-indigo-100 text-indigo-900' : 'bg-amber-100 text-amber-900'}`}>
            {trabajador.asegurado ? 'Asegurado' : 'No asegurado'}
          </span>
          {fincaDestino && <span className={`${BADGE_CLASS} bg-sky-100 text-sky-900`}>Trabajador trasladado a: {fincaDestino}</span>}
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="flex flex-wrap justify-end gap-2">
          <BotonFila onClick={() => actions.onVer(trabajador)} className={BOTON_VER}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            Ver
          </BotonFila>
          <BotonFila onClick={() => actions.onEdit(trabajador)} className={BOTON_EDITAR}>
            Editar
          </BotonFila>
          <BotonFila onClick={() => actions.onToggleActive(trabajador)} className={trabajador.activo ? BOTON_DESACTIVAR : BOTON_ACTIVAR}>
            {trabajador.activo ? 'Desactivar' : 'Activar'}
          </BotonFila>
        </div>
      </td>
    </tr>
  )
}

interface BotonFilaProps {
  onClick: () => void
  className: string
  children: ReactNode
}

function BotonFila({ onClick, className, children }: BotonFilaProps) {
  return (
    <button type="button" onClick={onClick} className={`${BOTON_TABLA} ${className}`}>
      {children}
    </button>
  )
}
