import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sprout } from 'lucide-react'
import { BOTON_ICONO_PLANO, BOTON_PRIMARIO_COMPACTO } from '../../../shared/constants/botones.constants'
import { useAuthForm } from '../hooks/use-auth-form'
import { AUTH_FORM_CONTENT as content } from '../constants/auth-form-content.constants'

export function AuthForm() {
  const form = useAuthForm()
  const [mostrarPassword, setMostrarPassword] = useState(false)

  return (
    <div className="neu-raised w-full rounded-[2rem] p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3 md:hidden">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-white">
          <Sprout className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-green-800">AgroMonitoreo</p>
          <p className="font-bold text-slate-700">Fincas</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Acceso supervisor/oficina
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{content.title}</h1>
        <p className="mt-3 text-base font-semibold leading-7 text-slate-600">{content.subtitle}</p>
      </div>

      <form className="space-y-5" onSubmit={form.handleSubmit}>
        <label className="block" htmlFor="email">
          <span className="mb-2 block text-sm font-black text-slate-700">Correo</span>
          <span className="neu-well flex min-h-14 items-center gap-3 rounded-2xl px-4">
            <Mail className="h-5 w-5 text-green-800" aria-hidden="true" />
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => form.setEmail(event.target.value)}
              className="min-h-14 flex-1 bg-transparent text-base font-bold text-slate-900 outline-none placeholder:text-slate-500"
              placeholder="nombreusuario@gmail.com"
              autoComplete="email"
              required
            />
          </span>
        </label>

        <div>
          <label className="mb-2 block text-sm font-black text-slate-700" htmlFor="password">
            Contraseña
          </label>
          <span className="neu-well flex min-h-14 items-center gap-3 rounded-2xl pl-4 pr-2">
            <LockKeyhole className="h-5 w-5 text-green-800" aria-hidden="true" />
            <input
              id="password"
              type={mostrarPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => form.setPassword(event.target.value)}
              className="min-h-14 flex-1 bg-transparent text-base font-bold text-slate-900 outline-none placeholder:text-slate-500"
              placeholder="Tu contraseña"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setMostrarPassword((valor) => !valor)}
              className={BOTON_ICONO_PLANO}
              aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={mostrarPassword}
            >
              {mostrarPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </span>
          <Link className="mt-2 inline-block text-sm font-bold text-green-800 underline decoration-2 underline-offset-4" to="/olvide-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {form.error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{form.error}</p>}

        <button
          type="submit"
          disabled={form.isSubmitting || form.segundosRestantes > 0}
          className={`${BOTON_PRIMARIO_COMPACTO} w-full`}
        >
          {form.isSubmitting
            ? 'Procesando...'
            : form.segundosRestantes > 0
              ? `Espera ${form.segundosRestantes}s`
              : content.button}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-bold text-slate-600">{content.aviso}</p>
    </div>
  )
}
