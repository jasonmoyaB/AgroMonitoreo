import { useEffect, useRef } from 'react'

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
        Entra como supervisor de Birrisito. Para volverlo oficina, edítalo desde esta misma tabla cuando acepte.
      </p>

      {error && <p className="rounded-2xl bg-red-100 p-4 font-black text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-16 cursor-pointer rounded-2xl bg-green-700 px-5 text-xl font-black text-white shadow-lg shadow-green-900/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Enviando' : 'Enviar invitación'}
      </button>
    </form>
  )
}
