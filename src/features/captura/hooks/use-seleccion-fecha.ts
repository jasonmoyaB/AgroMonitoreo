import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCapturaSessionStore, useFechaCaptura } from '../../../shared/stores/captura-session-store'
import { construirFechaIso, descomponerFechaIso } from '../../../shared/utils/fecha-iso'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'
import { ajustarFechaALimites } from '../utils/ajustar-fecha-a-limites'
import { obtenerLimitesFecha } from '../utils/obtener-limites-fecha'

export function useSeleccionFecha() {
  const navigate = useNavigate()
  const fechaGuardada = useFechaCaptura()
  const establecerFecha = useCapturaSessionStore((state) => state.establecerFecha)
  const [fecha, setFecha] = useState(() => descomponerFechaIso(fechaGuardada))

  // Calculado en cada render y no a nivel de modulo: la PWA queda abierta de un dia para
  // otro y un tope congelado dejaria elegir fechas que ya son futuras.
  const hoyIso = fechaLocalIso()
  const { mesMaximo, diaMaximo } = obtenerLimitesFecha(fecha.anio, fecha.mes, hoyIso)

  function actualizar(cambio: Partial<typeof fecha>) {
    setFecha((actual) => ajustarFechaALimites({ ...actual, ...cambio }, hoyIso))
  }

  // Se revalida contra la fecha del momento del click y no contra el `hoyIso` del render:
  // si la pantalla quedo abierta cruzando la medianoche, ese ya es de ayer.
  function aceptar() {
    establecerFecha(construirFechaIso(ajustarFechaALimites(fecha, fechaLocalIso())))
    navigate(-1)
  }

  return {
    fecha,
    anioMaximo: descomponerFechaIso(hoyIso).anio,
    mesMaximo,
    diaMaximo,
    esHoy: construirFechaIso(fecha) === hoyIso,
    seleccionarAnio: (anio: number) => actualizar({ anio }),
    seleccionarMes: (mes: number) => actualizar({ mes }),
    seleccionarDia: (dia: number) => actualizar({ dia }),
    irAHoy: () => setFecha(descomponerFechaIso(hoyIso)),
    aceptar,
    volver: () => navigate(-1),
  }
}
