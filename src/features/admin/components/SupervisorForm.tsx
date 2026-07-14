import { useEffect, useRef } from 'react'
import type { Finca } from '../../../shared/types/domain.types'
import { ROLES_DISPONIBLES, ROL_LABELS } from '../constants/rol.constants'
import type { SupervisoresCrudActions, SupervisoresCrudState } from '../types/supervisor-crud.types'

interface SupervisorFormProps {
  state: SupervisoresCrudState
  actions: SupervisoresCrudActions
  fincas: readonly Finca[]
}

export function SupervisorForm({ state, actions, fincas }: SupervisorFormProps) {
  const { values, error, isSubmitting } = state
  const nombreInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nombreInputRef.current?.focus()
  }, [])

  return (
    <form onSubmit={actions.onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 font-black text-slate-800">
        Nombre
        <input
          ref={nombreInputRef}
          value={values.nombre}
          onChange={(event) => actions.onFieldChange('nombre', event.target.value)}
          className="neu-pressed min-h-16 rounded-2xl px-4 text-xl font-black text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
          required
        />
      </label>

      <label className="flex flex-col gap-2 font-black text-slate-800">
        Rol
        <select
          value={values.rol}
          onChange={(event) => actions.onFieldChange('rol', event.target.value as SupervisoresCrudState['values']['rol'])}
          className="neu-pressed min-h-16 rounded-2xl px-4 text-xl font-black text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
        >
          {ROLES_DISPONIBLES.map((rol) => (
            <option key={rol} value={rol}>
              {ROL_LABELS[rol]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 font-black text-slate-800">
        Finca
        <select
          value={values.fincaId}
          onChange={(event) => actions.onFieldChange('fincaId', event.target.value)}
          className="neu-pressed min-h-16 rounded-2xl px-4 text-xl font-black text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
        >
          {fincas.map((finca) => (
            <option key={finca.id} value={finca.id}>
              {finca.nombre}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="rounded-2xl bg-red-100 p-4 font-black text-red-700">{error}</p>}

      <button type="submit" disabled={isSubmitting} className="min-h-16 cursor-pointer rounded-2xl bg-green-700 px-5 text-xl font-black text-white shadow-lg shadow-green-900/20 disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? 'Guardando' : 'Guardar'}
      </button>
    </form>
  )
}
