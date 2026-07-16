import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordChecklist } from '../components/PasswordChecklist'
import { usePasswordRecoverySession } from '../hooks/use-password-recovery-session'
import { useResetPasswordForm } from '../hooks/use-reset-password-form'

export function ResetPasswordScreen() {
  const estadoRecuperacion = usePasswordRecoverySession()

  if (estadoRecuperacion === 'cargando') return <AuthLayout>{null}</AuthLayout>
  if (estadoRecuperacion === 'invalida') return <EnlaceInvalido />
  return <FormularioNuevaPassword />
}

function EnlaceInvalido() {
  return (
    <AuthLayout>
      <div className="neu-raised w-full rounded-[2rem] p-6 sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Enlace vencido</h1>
        <p className="mt-3 text-base font-semibold leading-7 text-slate-600">
          Este enlace de recuperación ya no es válido. Solicita uno nuevo para continuar.
        </p>
        <Link
          className="mt-8 flex min-h-14 w-full items-center justify-center rounded-2xl bg-green-700 px-5 text-lg font-black text-white shadow-lg shadow-green-900/20 transition-colors duration-200 hover:bg-green-800"
          to="/olvide-password"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    </AuthLayout>
  )
}

function FormularioNuevaPassword() {
  const form = useResetPasswordForm()
  const [mostrarPassword, setMostrarPassword] = useState(false)

  return (
    <AuthLayout>
      <div className="neu-raised w-full rounded-[2rem] p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Crea una nueva contraseña</h1>
          <p className="mt-3 text-base font-semibold leading-7 text-slate-600">
            Elige una contraseña segura para volver a entrar.
          </p>
        </div>

        <form className="space-y-5" onSubmit={form.handleSubmit}>
          <label className="block" htmlFor="password-nueva">
            <span className="mb-2 block text-sm font-black text-slate-700">Nueva contraseña</span>
            <span className="neu-well flex min-h-14 items-center gap-3 rounded-2xl pl-4 pr-2">
              <LockKeyhole className="h-5 w-5 text-green-800" aria-hidden="true" />
              <input
                id="password-nueva"
                type={mostrarPassword ? 'text' : 'password'}
                value={form.values.password}
                onChange={(event) => form.updateField('password', event.target.value)}
                className="min-h-14 flex-1 bg-transparent text-base font-bold text-slate-900 outline-none placeholder:text-slate-500"
                placeholder="Crea una contraseña segura"
                autoComplete="new-password"
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
            <PasswordChecklist password={form.values.password} />
          </label>

          <label className="block" htmlFor="password-confirmacion">
            <span className="mb-2 block text-sm font-black text-slate-700">Confirmar contraseña</span>
            <span className="neu-well flex min-h-14 items-center gap-3 rounded-2xl pl-4 pr-2">
              <LockKeyhole className="h-5 w-5 text-green-800" aria-hidden="true" />
              <input
                id="password-confirmacion"
                type={mostrarPassword ? 'text' : 'password'}
                value={form.values.confirmacion}
                onChange={(event) => form.updateField('confirmacion', event.target.value)}
                className="min-h-14 flex-1 bg-transparent text-base font-bold text-slate-900 outline-none placeholder:text-slate-500"
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                required
              />
            </span>
          </label>

          {form.error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{form.error}</p>}

          <button
            type="submit"
            disabled={form.isSubmitting}
            className="min-h-14 w-full cursor-pointer rounded-2xl bg-green-700 px-5 text-lg font-black text-white shadow-lg shadow-green-900/20 transition-colors duration-200 hover:bg-green-800 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-green-900 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {form.isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
