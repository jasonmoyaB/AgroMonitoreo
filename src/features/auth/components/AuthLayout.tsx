import { Sprout } from 'lucide-react'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#edf7ea] text-slate-900">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-[1fr_440px] md:px-8">
        <div className="relative hidden min-h-[620px] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-900 via-green-700 to-lime-600 p-10 text-white shadow-2xl md:block">
          <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-tl-[8rem] bg-amber-300/25" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Sprout className="h-8 w-8" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-lime-100">AgroMonitoreo</p>
                <p className="text-lg font-bold">Fincas</p>
              </div>
            </div>

            <div className="max-w-md">
              <p className="mb-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-lime-50 backdrop-blur">
                Control diario de labores agrícolas
              </p>
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight">
                Registra la jornada desde el campo.
              </h1>
              <p className="mt-5 text-lg font-semibold leading-8 text-lime-50/90">
                Acceso simple para supervisores, pensado para capturar horas y producción sin fricción.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {['Cosecha', 'Amarres', 'Tramos'].map((label) => (
                <div key={label} className="rounded-3xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-sm font-bold text-lime-50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {children}
      </section>
    </main>
  )
}
