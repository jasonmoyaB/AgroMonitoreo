import { useEffect, useState } from 'react'
import { calcularCooldownMs } from '../utils/calcular-cooldown-ms'

export function useLoginCooldown() {
  const [intentos, setIntentos] = useState(0)
  const [bloqueadoHasta, setBloqueadoHasta] = useState<number | null>(null)
  const [segundosRestantes, setSegundosRestantes] = useState(0)

  useEffect(() => {
    if (bloqueadoHasta === null) return

    const intervalo = setInterval(() => {
      const restanteMs = bloqueadoHasta - Date.now()
      if (restanteMs <= 0) {
        setSegundosRestantes(0)
        setBloqueadoHasta(null)
        return
      }
      setSegundosRestantes(Math.ceil(restanteMs / 1000))
    }, 1000)

    return () => clearInterval(intervalo)
  }, [bloqueadoHasta])

  function registrarIntentoFallido() {
    const siguienteIntentos = intentos + 1
    setIntentos(siguienteIntentos)

    const cooldownMs = calcularCooldownMs(siguienteIntentos)
    if (cooldownMs === 0) return

    setBloqueadoHasta(Date.now() + cooldownMs)
    setSegundosRestantes(Math.ceil(cooldownMs / 1000))
  }

  function resetear() {
    setIntentos(0)
    setBloqueadoHasta(null)
    setSegundosRestantes(0)
  }

  return { segundosRestantes, registrarIntentoFallido, resetear }
}
