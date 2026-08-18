import { useEffect, useRef } from 'react'
import { BOTON_PRIMARIO } from '../../../shared/constants/botones.constants'

interface InvitarUsuarioFormProps {
  email: string
  error: string | null
  isSubmitting: boolean
  onEmailChange: (email: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function InvitarUsuarioForm({ email, error, isSubmitting, onEmailChange, onSubmit }: InvitarUsuarioFormProps) {
  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 font-black text-slate-800">
        Correo
        <input
          ref={emailInputRef}
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="nombreusuario@gmail.com"
          autoComplete="off"
          className="neu-pressed min-h-16 rounded-2xl px-4 text-xl font-black text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
          required
        />
      </label>

      <p className="font-bold leading-6 text-slate-600">
        Entra como supervisor sin finca. Cuando acepte, asígnale la finca desde esta misma tabla — hasta entonces no puede cargar ni editar datos de ninguna finca.
      </p>

      {error && <p className="rounded-2xl bg-red-100 p-4 font-black text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={BOTON_PRIMARIO}
      >
        {isSubmitting ? 'Enviando' : 'Enviar invitación'}
      </button>
    </form>
  )
}
