# Patrones de diseño para PDF

Todos los PDF descargables de AgroMonitoreo deben leerse como la misma aplicación impresa: misma paleta, misma tipografía, mismo ritmo vertical y las mismas piezas. Esta guía es obligatoria para documentos nuevos y para cambios en los existentes.

## Fuente de verdad

| Archivo | Qué aporta |
|---|---|
| `src/shared/utils/pdf/tokens-pdf.ts` | Paleta, escala tipográfica, espaciados y ritmo vertical. **Ningún generador declara colores ni coordenadas propias.** |
| `src/shared/utils/pdf/estilos-pdf.ts` | Bloques: fondo, encabezado, tarjeta de resumen, título de sección, pie, rectángulo y línea. |
| `src/shared/utils/pdf/tabla-pdf.ts` | Encabezado de tabla, fila, fila de estado vacío y las funciones que calculan su geometría. |
| `src/shared/utils/pdf/secciones-dashboard-pdf.ts` | Secciones del dashboard (rankings y producción diaria) para una unidad de medida. Es el único generador con coordenadas de columna propias (`COLUMNA`, `TENDENCIA.separacion`), heredadas de cuando vivían dentro de `generar-pdf-dashboard.ts`. **Deuda conocida: deberían subir a `tokens-pdf.ts`.** |
| `src/shared/lib/pdf-doc.ts` | Motor: `textoPdf` (peso y alineación) y `crearBlobPdf`. |
| `src/shared/lib/pdf-texto.ts` | Normalización a ASCII, medición con la tabla oficial de Helvetica y recorte por ancho real. |

Un generador solo debe contener **qué** se dibuja y en qué orden. El **cómo** vive en esos archivos.

## Documentos multipágina

`crearBlobPdf` acepta un stream (una página) o un array de streams (una página por elemento); arma el `/Kids`, el `/Count` y la `xref` solo. Hoy el único multipágina es el dashboard: **una página por unidad de medida**, porque cajas y tramos no se suman y las dos tablas no entran en una hoja.

Cada página se pinta entera y por separado — fondo, encabezado y pie propios — y arranca en `PDF_LAYOUT.contenidoTop`. Lo que es del mes y no de la página (las tarjetas de KPI) va **solo en la primera**; el resto arranca más arriba porque no las lleva. No hay numeración de páginas: el subtítulo dice de qué unidad es cada una.

## Paleta

Espejo exacto de los tokens de la app (`src/index.css` + clases Tailwind). No se introducen colores decorativos por documento.

| Uso | Color | Referencia en la app | Token |
|---|---|---|---|
| Fondo del documento | `#E7EBF1` | `--neu-bg` | `PDF_COLORES.fondo` |
| Superficie de tarjetas y filas | `#FFFFFF` | superficie clara | `PDF_COLORES.superficie` |
| Texto principal | `#0F172A` | `text-slate-900` | `PDF_COLORES.texto` |
| Texto secundario | `#475569` | `text-slate-600` | `PDF_COLORES.secundario` |
| Bordes y separadores | `#CBD5E1` | `slate-300` | `PDF_COLORES.borde` |
| Identidad y valores destacados | `#15803D` | `green-700` | `PDF_COLORES.verde` |
| Bandas, encabezados de tabla y títulos de sección | `#166534` | `green-800` | `PDF_COLORES.verdeOscuro` |
| Descuentos, ausencias y alertas | `#B91C1C` | `red-700` | `PDF_COLORES.rojo` |

El verde es marca y resultado positivo. El rojo **solo** significa algo: descuento, ausencia, hora extra. Nunca decoración.

## Página y ritmo vertical

A4 vertical (`595 × 842 pt`), margen lateral `40 pt`, ancho útil `515 pt`, borde derecho `555 pt`. Todo sale de `PDF_PAGINA`.

El eje vertical es fijo (`PDF_LAYOUT`) y ningún documento lo redefine:

```
842 ┬ banda de marca (24 pt, verde oscuro) — "AGROMONITOREO" y el tipo de documento
818 ┤
780 ┤ título (21 pt, negrita)
762 ┤ subtítulo / contexto (11 pt, secundario)
744 ┤ regla
726 ┤ contenidoTop — borde superior del primer bloque
    │
 80 ┤ contenidoBottom — nada baja de acá
 62 ┤ regla del pie
 44 ┴ "Generado: dd/mm/aaaa" y la marca
```

Cada bloque arranca en `contenidoTop` y baja restando alturas y espacios (`PDF_ESPACIO`: `xs 6`, `sm 10`, `md 16`, `lg 24`). Las coordenadas se **derivan**, nunca se escriben a mano:

```ts
const RESUMEN_BOTTOM = PDF_LAYOUT.contenidoTop - PDF_LAYOUT.tarjetaAlto
const SECCION_Y = RESUMEN_BOTTOM - PDF_ESPACIO.lg
const TABLA_TOP = SECCION_Y - PDF_ESPACIO.md
```

## Tipografía

Helvetica y Helvetica-Bold, las dos incorporadas al motor (`/F1` y `/F2`). No se incrustan fuentes externas: es lo que garantiza que abra igual en cualquier lector. La jerarquía se hace con **peso + tamaño + color**, nunca con mayúsculas forzadas ni subrayados.

| Rol | Token | pt | Peso |
|---|---|---|---|
| Marca y tipo de documento | `marca` | 9 | negrita / normal |
| Título | `titulo` | 21 | negrita |
| Subtítulo y contexto | `subtitulo` | 11 | normal |
| Título de sección | `seccion` | 11 | negrita, verde oscuro |
| Valor de campo destacado | `campo` | 13 | negrita |
| Etiqueta corta | `etiqueta` | 8 | normal |
| Texto de tabla y párrafo | `cuerpo` | 10 | normal |
| Encabezado de tabla | `tabla` | 9 | negrita, blanco |
| Valor de tarjeta | `dato` | 15 | negrita |
| Neto o total del documento | `destacado` | 24 | negrita |
| Pie | `pie` | 8 | normal |

Mayúsculas **solo** en micro-etiquetas de una o dos palabras (`AGROMONITOREO`, `TRABAJADOR`, `PERIODO`, `NETO PAGADO`). Los títulos de tarjeta, de sección y de columna van en oración: en mayúsculas ocupan ~15% más y se recortan.

## Alineación y medición

`textoPdf` sabe medir, así que no hay excusa para desalinear:

- `alinear: 'derecha'` → `x` es el borde derecho. **Toda columna numérica y todo monto va a la derecha**, para que las cifras se lean como una columna.
- `alinear: 'centro'` → `x` es el centro. Se usa en cabeceras de calendario y etiquetas de firma.
- Texto que puede desbordar se pasa por `acortarTextoPdf({ valor, anchoMaximo, size, peso })`, que corta por ancho real y agrega `...`. Nunca truncar por cantidad de caracteres: `MMMM` y `llll` no miden lo mismo.

## Componentes

| Pieza | Función | Regla |
|---|---|---|
| Fondo | `pintarFondoPdf()` | Primera instrucción del stream, siempre. |
| Encabezado | `pintarEncabezadoPdf({ titulo, subtitulo, meta })` | `meta` es el **tipo de documento** (`COMPROBANTE DE PAGO`, `REPORTE DE GESTION`, `CONTROL DE ASISTENCIA`, `REPORTE INDIVIDUAL`), alineado a la derecha. La finca, el trabajador y el período van en `subtitulo`. |
| Tarjeta de resumen | `pintarTarjetaResumenPdf()` | Superficie blanca, borde `slate-300`, barra verde de 4 pt a la izquierda. Alto `PDF_LAYOUT.tarjetaAlto`. El ancho se reparte: `(contenido - (n-1) * gap) / n`. |
| Título de sección | `pintarTituloSeccionPdf({ titulo, y })` | Verde oscuro, negrita, con su regla debajo. |
| Tabla | `pintarEncabezadoTablaPdf` + `pintarFilaTablaPdf` | `y` es siempre el **borde superior** de la banda; la línea base la calcula la propia función. Encabezado verde oscuro con texto blanco, filas alternas blanco / fondo, borde `slate-300`. Posición de cada fila con `topFilaPdf(top, index)`; alto total con `altoTablaPdf(filas)`. |
| Estado vacío | `pintarVacioTablaPdf({ mensaje, y })` | Una fila que dice qué falta ("Sin datos del mes."), nunca una tabla en blanco ni un hueco. |
| Total del documento | Bloque `verdeOscuro` a ancho completo | Etiqueta en mayúsculas a la izquierda, cifra `destacado` alineada a la derecha. |
| Pie | `pintarPiePdf(fecha)` | La fecha siempre con `formatearFechaIsoDdMmAaaa(fechaLocalIso())`, nunca `toLocaleDateString`. |

## Contenido

- El título describe el documento, no la acción de descarga ("Liquidacion de quincena", no "Descargar liquidación").
- Contexto (finca, trabajador, período) inmediatamente bajo el título.
- Orden del flujo: **contexto → resumen → detalle → cierre**.
- Los montos siempre por `formatearMonto(monto, moneda)`; los números por `toLocaleString('es-CL')`. Nunca concatenar el símbolo a mano.
- Los encabezados de columna son cortos y no invaden la columna vecina. Si una etiqueta no entra, se acorta la etiqueta — no se agranda la tabla.
- Tildes, `₡`, comillas tipográficas y guiones largos se normalizan solos (`normalizarTextoPdf`). No hay que evitarlos al escribir, pero tampoco hay que confiar en que se vean: el PDF imprime `CRC`, no `₡`.

## Lista de verificación

- [ ] Importa colores, tamaños y coordenadas desde `tokens-pdf.ts`; no declara ninguno propio.
- [ ] Deriva cada `y` de `PDF_LAYOUT.contenidoTop` y `PDF_ESPACIO`; no hay números de posición sueltos.
- [ ] Usa `pintarFondoPdf`, `pintarEncabezadoPdf` y `pintarPiePdf`.
- [ ] Toda cifra está alineada a la derecha; todo texto que puede desbordar pasa por `acortarTextoPdf`.
- [ ] Tiene estado vacío explícito, **también cuando el documento entero está vacío**: un mes sin datos se imprime con sus filas de "Sin datos del mes.", nunca como una página con encabezado y nada debajo.
- [ ] Se agregó al `it.each` de `test/shared/utils/pdf/area-segura-pdf.test.ts`, con datos largos a propósito.
- [ ] Pasa `pnpm build`, `pnpm lint`, `pnpm exec vitest run` y `pnpm dlx react-doctor --verbose` al 100%.

## Documentos cubiertos

| Documento | Generador | Tipo (`meta`) |
|---|---|---|
| Dashboard mensual | `src/shared/utils/pdf/generar-pdf-dashboard.ts` (+ `secciones-dashboard-pdf.ts`) | `REPORTE DE GESTION` |
| Ausencias del mes | `src/features/asistencia/utils/generar-pdf-ausencias.ts` | `CONTROL DE ASISTENCIA` |
| Métricas por trabajador | `src/features/trabajadores/utils/generar-pdf-metricas-trabajador.ts` | `REPORTE INDIVIDUAL` |
| Liquidación de quincena | `src/features/planilla/utils/generar-pdf-liquidacion.ts` | `COMPROBANTE DE PAGO` |

Todo PDF nuevo se agrega a esta tabla y reutiliza la fuente de verdad visual.
