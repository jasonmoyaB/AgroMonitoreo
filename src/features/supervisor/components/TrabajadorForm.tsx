import { useEffect, useRef } from 'react'
import { Avatar } from '../../../shared/components/Avatar'
import { CampoTexto, INPUT_NEU_CLASS } from '../../../shared/components/CampoTexto'
import { crearClaseToggle } from '../../../shared/utils/crear-clase-toggle'
import type { TrabajadoresCrudActions, TrabajadoresCrudState } from '../../trabajadores/types/trabajador-crud.types'

const TAMANO_AVATAR_PREVIEW_PX = 72

interface TrabajadorFormProps {
  state: Pick<TrabajadoresCrudState, 'values' | 'error' | 'isSubmitting' | 'fotoPreviewUrl'>
  actions: Pick<TrabajadoresCrudActions, 'onFieldChange' | 'onFotoChange' | 'onSubmit'>
}

export function TrabajadorForm({ state, actions }: TrabajadorFormProps) {
  const { values, error, isSubmitting, fotoPreviewUrl } = state
  const nombreInputRef = useRef<HTMLInputElement>(null)

  // por ref y no con autoFocus: el atributo nativo lo marca react-doctor/no-autofocus
  useEffect(() => {
    nombreInputRef.current?.focus()
  }, [])

  return (
    <form onSubmit={actions.onSubmit} className="flex flex-col gap-4">
      {/* no usa CampoTexto: es el unico requerido y el unico con foco inicial */}
      <label className="flex flex-col gap-2 font-black text-slate-800">
        Nombre completo
        <input ref={nombreInputRef} value={values.nombreCompleto} onChange={(event) => actions.onFieldChange('nombreCompleto', event.target.value)} className={INPUT_NEU_CLASS} required />
      </label>

      <label className="flex flex-col gap-2 font-black text-slate-800">
        Foto
        <div className="flex items-center gap-4">
          <Avatar nombre={values.nombreCompleto || '?'} fotoUrl={fotoPreviewUrl} size={TAMANO_AVATAR_PREVIEW_PX} />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => actions.onFotoChange(event.target.files?.[0] ?? null)}
            className="min-w-0 flex-1 text-sm font-bold text-slate-700 file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-xl file:border-0 file:bg-green-700 file:px-4 file:font-black file:text-white"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">JPG, PNG o WEBP. Máximo 5 MB.</span>
      </label>

      {/* la ayuda dice solo "Opcional": hoy estos campos se guardan y se ven en el
          detalle, nada mas. Prometer que la cedula sale en el comprobante o que la
          fecha define la antiguedad es mentirle al capataz hasta que exista. */}
      <CampoTexto etiqueta="Cédula" valor={values.cedula} onChange={(valor) => actions.onFieldChange('cedula', valor)} ayuda="Opcional." />

      {/* input type=date nativo: el picker del sistema ya es tactil y localizado */}
      <CampoTexto etiqueta="Fecha de ingreso" valor={values.fechaIngreso} onChange={(valor) => actions.onFieldChange('fechaIngreso', valor)} tipo="date" ayuda="Opcional." />

      <CampoTexto etiqueta="Teléfono" valor={values.telefono} onChange={(valor) => actions.onFieldChange('telefono', valor)} tipo="tel" />

      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Estado del trabajador">
        <button type="button" aria-pressed={values.activo} onClick={() => actions.onFieldChange('activo', true)} className={crearEstadoClass(values.activo)}>
          Activo
        </button>
        <button type="button" aria-pressed={!values.activo} onClick={() => actions.onFieldChange('activo', false)} className={crearEstadoClass(!values.activo)}>
          Inactivo
        </button>
      </div>

      {error && <p className="rounded-2xl bg-red-100 p-4 font-black text-red-700">{error}</p>}

      <button type="submit" disabled={isSubmitting} className="min-h-16 cursor-pointer rounded-2xl bg-green-700 px-5 text-xl font-black text-white shadow-lg shadow-green-900/20 disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? 'Guardando' : 'Guardar'}
      </button>
    </form>
  )
}

function crearEstadoClass(isSelected: boolean) {
  return crearClaseToggle(isSelected, 'text-lg')
}
