import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sprout } from 'lucide-react'
import { useAuthForm } from '../hooks/use-auth-form'
import type { AuthMode } from '../types/auth.types'

const CONTENT = {
  login: {
    title: 'Entrar al campo',
    subtitle: 'Inicia sesión para registrar labores de la finca.',
    button: 'Iniciar sesión',
    footer: '¿Nuevo supervisor?',
    linkText: 'Crear cuenta',
    linkTo: '/registro',
  },
  register: {
    title: 'Crear supervisor',
    subtitle: 'Toda cuenta nueva se registra con el rol supervisor.',
    button: 'Crear cuenta',
    footer: '¿Ya tienes cuenta?',
    linkText: 'Iniciar sesión',
    linkTo: '/login',
  },
} as const

interface AuthFormProps {
  mode: AuthMode
}

export function AuthForm({ mode }: AuthFormProps) {
  const content = CONTENT[mode]
  const form = useAuthForm(mode)
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
          Acceso supervisor
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
              placeholder="supervisor@finca.cl"
              autoComplete="email"
              required
            />
          </span>
        </label>

        <label className="block" htmlFor="password">
          <span className="mb-2 block text-sm font-black text-slate-700">Contraseña</span>
          <span className="neu-well flex min-h-14 items-center gap-3 rounded-2xl pl-4 pr-2">
            <LockKeyhole className="h-5 w-5 text-green-800" aria-hidden="true" />
            <input
              id="password"
              type={mostrarPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => form.setPassword(event.target.value)}
              className="min-h-14 flex-1 bg-transparent text-base font-bold text-slate-900 outline-none placeholder:text-slate-500"
              placeholder="Mínimo 6 caracteres"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
            <button
              type="button"
              onClick={() => setMostrarPassword((valor) => !valor)}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors duration-200 hover:text-green-800 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-green-900"
              aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={mostrarPassword}
            >
              {mostrarPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </span>
        </label>

        {form.error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{form.error}</p>}
        {form.notice && <p className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">{form.notice}</p>}

        <button
          type="submit"
          disabled={form.isSubmitting}
          className="min-h-14 w-full cursor-pointer rounded-2xl bg-green-700 px-5 text-lg font-black text-white shadow-lg shadow-green-900/20 transition-colors duration-200 hover:bg-green-800 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-green-900 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {form.isSubmitting ? 'Procesando...' : content.button}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-bold text-slate-600">
        {content.footer}{' '}
        <Link className="text-green-800 underline decoration-2 underline-offset-4" to={content.linkTo}>
          {content.linkText}
        </Link>
      </p>
    </div>
  )
}
