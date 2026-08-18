// Unica fuente de verdad visual de los PDF. Ningun generador declara colores,
// tamanos ni coordenadas propias: todo sale de aca.

const MARGEN = 40
const ANCHO_PAGINA = 595

export const PDF_PAGINA = {
  ancho: ANCHO_PAGINA,
  alto: 842,
  margen: MARGEN,
  derecha: ANCHO_PAGINA - MARGEN,
  contenido: ANCHO_PAGINA - MARGEN * 2,
} as const

// Espejo de los tokens de la app (src/index.css + clases Tailwind), en RGB 0-1.
export const PDF_COLORES = {
  fondo: '0.906 0.922 0.945', // --neu-bg #E7EBF1
  superficie: '1 1 1',
  texto: '0.059 0.090 0.165', // slate-900
  secundario: '0.278 0.333 0.412', // slate-600
  borde: '0.796 0.835 0.882', // slate-300
  verde: '0.082 0.502 0.239', // green-700
  verdeOscuro: '0.086 0.396 0.204', // green-800
  rojo: '0.725 0.110 0.110', // red-700
  blanco: '1 1 1',
} as const

export const PDF_TIPO = {
  marca: 9,
  titulo: 21,
  subtitulo: 11,
  seccion: 11,
  campo: 13,
  etiqueta: 8,
  cuerpo: 10,
  tabla: 9,
  dato: 15,
  destacado: 24,
  pie: 8,
} as const

export const PDF_ESPACIO = { xs: 6, sm: 10, md: 16, lg: 24 } as const

// Ritmo vertical unico. Todo bloque arranca en `contenidoTop` y baja restando
// alturas y espacios; nada puede pasar de `contenidoBottom`.
export const PDF_LAYOUT = {
  bandaY: 818,
  bandaAlto: 24,
  marcaY: 826,
  tituloY: 780,
  subtituloY: 762,
  reglaY: 744,
  contenidoTop: 726,
  contenidoBottom: 80,
  pieReglaY: 62,
  pieY: 44,
  tarjetaAlto: 52,
  filaAlto: 22,
} as const
