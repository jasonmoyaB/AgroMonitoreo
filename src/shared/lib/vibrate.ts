const DURACION_VIBRACION_MS = 80

export function vibrarConfirmacion(): void {
  navigator.vibrate?.(DURACION_VIBRACION_MS)
}
