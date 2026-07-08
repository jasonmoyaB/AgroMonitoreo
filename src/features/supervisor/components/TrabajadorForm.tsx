import type { TrabajadoresCrudActions, TrabajadoresCrudState } from '../../trabajadores/types/trabajador-crud.types'

interface TrabajadorFormProps {
  state: Pick<TrabajadoresCrudState, 'values' | 'trabajadorEditando' | 'error' | 'success' | 'isSubmitting'>
  actions: Pick<TrabajadoresCrudActions, 'onFieldChange' | 'onSubmit' | 'onCreateNew'>
}

export function TrabajadorForm({ state, actions }: TrabajadorFormProps) {
  const { values, trabajadorEditando, error, success, isSubmitting } = state

  return (
    <form onSubmit={actions.onSubmit} className="neu-raised flex flex-col gap-4 rounded-[2rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Trabajador</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">{trabajadorEditando ? 'Editar' : 'Agregar trabajador'}</h2>
        </div>
        {trabajadorEditando && (
          <button type="button" onClick={actions.onCreateNew} className="neu-pressed min-h-12 rounded-2xl px-4 font-black text-slate-700">
            Nuevo
          </button>
        )}
      </div>

      <label className="flex flex-col gap-2 font-black text-slate-800">
        Nombre completo
        <input
          value={values.nombreCompleto}
          onChange={(event) => actions.onFieldChange('nombreCompleto', event.target.value)}
          className="neu-pressed min-h-16 rounded-2xl px-4 text-xl font-black text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
          required
        />
      </label>

      <label className="flex flex-col gap-2 font-black text-slate-800">
        Foto URL
        <input
          value={values.fotoUrl}
          onChange={(event) => actions.onFieldChange('fotoUrl', event.target.value)}
          className="neu-pressed min-h-14 rounded-2xl px-4 font-bold text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
          placeholder="Opcional"
          type="url"
        />
      </label>

      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Estado del trabajador">
        <button type="button" onClick={() => actions.onFieldChange('activo', true)} className={crearEstadoClass(values.activo)}>
          Activo
        </button>
        <button type="button" onClick={() => actions.onFieldChange('activo', false)} className={crearEstadoClass(!values.activo)}>
          Inactivo
        </button>
      </div>

      {error && <p className="rounded-2xl bg-red-100 p-4 font-black text-red-700">{error}</p>}
      {success && <p className="rounded-2xl bg-green-100 p-4 font-black text-green-800">{success}</p>}

      <button type="submit" disabled={isSubmitting} className="min-h-16 cursor-pointer rounded-2xl bg-green-700 px-5 text-xl font-black text-white shadow-lg shadow-green-900/20 disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? 'Guardando' : 'Guardar'}
      </button>
    </form>
  )
}

function crearEstadoClass(isSelected: boolean) {
  const selectedClass = isSelected ? 'bg-green-700 text-white shadow-lg shadow-green-900/20' : 'neu-pressed text-slate-700'
  return `min-h-14 cursor-pointer rounded-2xl px-4 text-lg font-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 ${selectedClass}`
}
