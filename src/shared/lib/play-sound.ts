const TONO_CONFIRMACION_HZ = 880
const DURACION_TONO_SEGUNDOS = 0.2

export function playConfirmSound(): void {
  if (typeof window === 'undefined' || !window.AudioContext) return

  const context = new window.AudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.frequency.value = TONO_CONFIRMACION_HZ
  oscillator.type = 'sine'
  gain.gain.setValueAtTime(0.15, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + DURACION_TONO_SEGUNDOS)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + DURACION_TONO_SEGUNDOS)
}
