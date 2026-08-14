// Botones de accion de las tablas (trabajadores, fincas, supervisores). Comparten
// forma y todos llevan relleno solido con sombra del mismo tono: "Editar" era el
// unico en neu-pressed y al lado de los demas se leia como deshabilitado.
// El azul no choca con verde (activar), rojo (desactivar) ni negro (ver), y va con
// el fondo neumorfico, que es un gris azulado.
export const BOTON_TABLA = 'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-black'

export const BOTON_VER = 'bg-slate-900 text-white shadow-lg shadow-slate-900/15'
export const BOTON_EDITAR = 'bg-sky-700 text-white shadow-lg shadow-sky-900/20'
export const BOTON_ACTIVAR = 'bg-green-700 text-white shadow-lg shadow-green-900/20'
export const BOTON_DESACTIVAR = 'bg-red-700 text-white shadow-lg shadow-red-900/20'
