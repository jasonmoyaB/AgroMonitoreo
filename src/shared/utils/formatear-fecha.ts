const OPCIONES_FECHA_CORTA: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
}

export function formatearFechaCorta(fecha: Date): string {
  return new Intl.DateTimeFormat('es-CL', OPCIONES_FECHA_CORTA).format(fecha)
}
