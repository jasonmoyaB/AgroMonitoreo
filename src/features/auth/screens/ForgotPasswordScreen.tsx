import { Link, Navigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { useAuthSession } from '../hooks/use-auth-session'
import { useForgotPasswordForm } from '../hooks/use-forgot-password-form'

export function ForgotPasswordScreen() {
  const { session, isLoading } = useAuthSession()
  const form = useForgotPasswordForm()

  if (!isLoading && session) return <Navigate to="/supervisor" replace />

  return (
    <AuthLayout>
      <div className="neu-raised w-full rounded-[2rem] p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">¿Olvidaste tu contraseña?</h1>
          <p className="mt-3 text-base font-semibold leading-7 text-slate-600">
            Escribe tu correo y te mandamos un enlace para crear una nueva contraseña.
          </p>
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

          {form.error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{form.error}</p>}
          {form.notice && <p className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">{form.notice}</p>}

          <button
            type="submit"
            disabled={form.isSubmitting}
            className="min-h-14 w-full cursor-pointer rounded-2xl bg-green-700 px-5 text-lg font-black text-white shadow-lg shadow-green-900/20 transition-colors duration-200 hover:bg-green-800 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-green-900 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {form.isSubmitting ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-bold text-slate-600">
          ¿Ya la recordaste?{' '}
          <Link className="text-green-800 underline decoration-2 underline-offset-4" to="/login">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
