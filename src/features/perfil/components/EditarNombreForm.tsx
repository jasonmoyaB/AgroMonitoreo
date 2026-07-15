import { User } from 'lucide-react'
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
          className="min-h-14 w-full cursor-pointer rounded-2xl bg-green-700 px-5 text-lg font-black text-white shadow-lg shadow-green-900/20 transition-colors duration-200 hover:bg-green-800 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-green-900 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {form.isSubmitting ? 'Guardando...' : 'Guardar nombre'}
        </button>
      </form>
    </div>
  )
}
