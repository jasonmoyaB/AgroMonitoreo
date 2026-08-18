import { User } from 'lucide-react'
import { BOTON_PRIMARIO_COMPACTO } from '../../../shared/constants/botones.constants'
import { useEditarNombreForm } from '../hooks/use-editar-nombre-form'
import type { Usuario } from '../../../shared/types/domain.types'

interface EditarNombreFormProps {
  usuario: Usuario
}

export function EditarNombreForm({ usuario }: EditarNombreFormProps) {
  const form = useEditarNombreForm(usuario)

  return (
    <div className="neu-raised rounded-[2rem] p-5">
      <h2 className="text-lg font-black text-slate-900">Nombre</h2>
      <p className="mt-1 font-bold text-slate-600">{usuario.email}</p>

      <form className="mt-4 space-y-4" onSubmit={form.handleSubmit}>
        <label className="block" htmlFor="nombre">
          <span className="mb-2 block text-sm font-black text-slate-700">Nombre completo</span>
          <span className="neu-well flex min-h-14 items-center gap-3 rounded-2xl px-4">
            <User className="h-5 w-5 text-green-800" aria-hidden="true" />
            <input
              id="nombre"
              value={form.nombre}
              onChange={(event) => form.setNombre(event.target.value)}
              className="min-h-14 flex-1 bg-transparent text-base font-bold text-slate-900 outline-none placeholder:text-slate-500"
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </span>
        </label>

        <button
          type="submit"
          disabled={form.isSubmitting}
          className={`${BOTON_PRIMARIO_COMPACTO} w-full`}
        >
          {form.isSubmitting ? 'Guardando...' : 'Guardar nombre'}
        </button>
      </form>
    </div>
  )
}
