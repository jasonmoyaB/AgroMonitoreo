import { MapPinOff, RefreshCw } from 'lucide-react'
import { useCerrarSesion } from '../hooks/use-cerrar-sesion'
import { useRecargarUsuario } from '../hooks/use-recargar-usuario'

// Pantalla de espera del invitado recien dado de alta: ya tiene cuenta y contrasena, pero
// todavia no pertenece a ninguna finca. Sin esto entraria al shell de supervisor vacio
// (RLS no le devuelve una sola fila) sin ninguna pista de por que no ve nada.
//
// Mismo criterio de UX que features/captura: iconos primero, texto corto, targets grandes.
export function SinFincaAsignada() {
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()
  const { recargar, isRecargando } = useRecargarUsuario()

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="neu-raised flex w-full max-w-md flex-col items-center gap-5 rounded-[2rem] p-8 text-center">
        <MapPinOff className="h-16 w-16 text-amber-600" aria-hidden="true" />
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Todavía no tienes finca</h1>
        <p className="text-lg font-bold leading-8 text-slate-600">Pídele al administrador que te asigne una. Cuando lo haga, toca el botón verde.</p>

        <button
          type="button"
          onClick={recargar}
          disabled={isRecargando}
          className="flex min-h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-green-700 px-5 text-xl font-black text-white shadow-lg shadow-green-900/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-6 w-6 ${isRecargando ? 'animate-spin' : ''}`} aria-hidden="true" />
          {isRecargando ? 'Revisando' : 'Revisar de nuevo'}
        </button>

        <button
          type="button"
          onClick={handleCerrarSesion}
          disabled={isSigningOut}
          className="neu-raised min-h-16 w-full cursor-pointer rounded-2xl px-5 text-xl font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSigningOut ? 'Saliendo' : 'Salir'}
        </button>
      </div>
    </main>
  )
}
