// Estilos compartidos de los botones: un rol, una constante. El mismo boton se veia
// distinto en cada pantalla porque cada archivo repetia la clase a mano — min-h-14 vs
// min-h-16 para el mismo submit, disabled:cursor-wait vs disabled:cursor-not-allowed,
// y los verdes primarios sin ningun anillo de foco (el teclado no veia el CTA).
//
// Los botones de accion de tabla viven aparte, en botones-tabla.constants.ts.
// Los pares tipo toggle, en shared/utils/crear-clase-toggle.ts.

// Anillo de foco unico para todo boton de la app. 2px es el minimo de WCAG 2.4.11 y el
// offset lo saca del relleno verde, donde green-900 sobre green-700 casi no se leia.
export const FOCO_ANILLO = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900'

// Accion principal: verde solido, uno por pantalla. El disabled va a gris y sin sombra
// en vez de verde translucido, que seguia leyendose como "tocame".
const PRIMARIO_BASE = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-green-700 px-5 font-black text-white shadow-lg shadow-green-900/20 transition-colors duration-200 hover:bg-green-800 ${FOCO_ANILLO} disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none`

// Submit de formulario y confirmaciones: el target grande que pide el uso en campo.
export const BOTON_PRIMARIO = `${PRIMARIO_BASE} min-h-16 text-xl`

// Cabeceras y barras de accion, donde el boton convive con un titulo.
export const BOTON_PRIMARIO_COMPACTO = `${PRIMARIO_BASE} min-h-14 text-lg`

// Accion secundaria: hundida en el fondo neumorfico. Lo unico que cambia es el tono —
// verde si hace algo (descargar PDF), pizarra si solo deshace (borrar filtros).
const SECUNDARIO_BASE = `neu-pressed inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 font-black transition-colors duration-200 ${FOCO_ANILLO} disabled:cursor-not-allowed disabled:opacity-60`

export const BOTON_SECUNDARIO = `${SECUNDARIO_BASE} text-green-900`
export const BOTON_NEUTRO = `${SECUNDARIO_BASE} text-slate-700`

// Cuadrado de solo icono (flechas de mes y de semana). 44px es el minimo tactil:
// antes unas flechas eran neu-raised de 44 y otras neu-pressed de 56, y ninguna
// tenia foco visible.
export const BOTON_ICONO = `neu-raised inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-2xl text-slate-700 ${FOCO_ANILLO} disabled:cursor-not-allowed disabled:opacity-40`

// Icono sin relieve, el que va dentro de un campo (mostrar/ocultar contrasena). No lleva
// superficie propia porque el relieve ya lo pone el campo que lo contiene.
export const BOTON_ICONO_PLANO = `inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors duration-200 hover:text-green-800 ${FOCO_ANILLO}`
