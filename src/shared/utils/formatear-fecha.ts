const FORMATEADOR_FECHA_CORTA = new Intl.DateTimeFormat('es-CL', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

export function formatearFechaCorta(fecha: Date): string {
  return FORMATEADOR_FECHA_CORTA.format(fecha)
}
