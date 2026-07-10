import { Compass, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#edf7ea] px-4 py-8 text-slate-900">
      <section className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-900 via-green-700 to-lime-600 p-10 text-center text-white shadow-2xl">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-lime-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-tl-[8rem] bg-amber-300/25" />

        <div className="relative flex flex-col items-center gap-6">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Compass className="h-9 w-9" aria-hidden="true" />
          </span>

          <p className="text-7xl font-black tracking-tight">404</p>

          <div>
            <h1 className="text-2xl font-black leading-tight">Esta página no existe</h1>
            <p className="mt-2 text-lg font-semibold text-lime-50/90">
              El link que seguiste no lleva a ningún lado. Volvamos al camino.
            </p>
          </div>

          <Link
            to="/"
            className="mt-2 inline-flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl bg-white px-8 text-lg font-bold text-green-800 shadow-lg transition-colors duration-200 hover:bg-lime-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-lime-200"
          >
            <Sprout className="h-6 w-6" aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  )
}
