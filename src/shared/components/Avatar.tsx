const TAMANO_POR_DEFECTO_PX = 96

interface AvatarProps {
  nombre: string
  fotoUrl: string | null
  size?: number
}

function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')
}

export function Avatar({ nombre, fotoUrl, size = TAMANO_POR_DEFECTO_PX }: AvatarProps) {
  const estilo = { width: size, height: size }

  if (fotoUrl) {
    return <img src={fotoUrl} alt="" className="rounded-full object-cover" style={estilo} />
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-emerald-600 font-bold text-white"
      style={{ ...estilo, fontSize: size / 2.5 }}
    >
      {obtenerIniciales(nombre)}
    </div>
  )
}
