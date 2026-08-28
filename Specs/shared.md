# Spec — shared

Lo que usan varias features. **`shared/` nunca importa de `features/`** — esa es la regla que decide qué sube acá.

## Qué vive acá

| Carpeta | Qué |
|---|---|
| `components/` | `LaborIcon`, `Avatar`, `NumericStepper`, `Modal`, `Toast`, charts, KPI cards, `DashboardPorUnidad` |
| `lib/` | Cliente Supabase, motor de PDF (`pdf-doc.ts`, `pdf-texto.ts`), sonido/vibración, `descargar-blob.ts`, persistencia del cache de queries (`persistencia-query.ts`) |
| `hooks/` | Red, cache persistente (`use-cache-persistente.ts`), descarga de PDF de dashboard, consulta a Hacienda |
| `stores/` | Zustand: sesión de captura, toasts |
| `utils/kpis/`, `utils/pdf/` | Cálculo de indicadores y sistema visual de PDF |
| `constants/` | `tipos-labor`, `meses`, `finca`, `hacienda`, `toast`, `botones`, `campos` |

## Reglas

- **Un solo `createClient`**, en `lib/supabase-client.ts`. Nunca un segundo. Nunca el `service_role` en el front.
- **Los PDF se generan a mano**, sin librería: streams, objetos numerados y tabla `xref`. `crearBlobPdf` acepta uno o varios streams (el dashboard es multipágina). Reglas obligatorias en `docs/PATRONES-DISENO-PDF.md`, guardia de layout en `test/shared/utils/pdf/area-segura-pdf.test.ts`.
- **Dos utils de formato, a propósito**: `formatear-monto.ts` para dinero (necesita la moneda de la fila) y `formatear-cantidad.ts` para lo que no es dinero (horas, producción, porcentajes; tope 1 decimal). No mezclarlos.
- **Fechas locales, nunca `toISOString()`**: `fecha-local.ts`. Desde las 18:00 en Costa Rica (UTC−6) el ISO ya devuelve el día siguiente.
- **Nada suma entre unidades.** `construir-dashboard-por-unidad.ts` devuelve un bloque por unidad presente en el mes; el orden lo fija `tipos-labor.constants.ts`.
- **`tipos-labor.constants.ts` duplica la tabla `labores` y nada verifica que coincidan.** Se sincronizan a mano. Una labor que falte acá desaparece del dashboard entero.
- **El cache de TanStack Query se persiste en IndexedDB** (`persistencia-query.ts` + `use-cache-persistente.ts`). Es lo que deja capturar sin señal: sin las lecturas rehidratadas la pantalla de captura no se pinta. Usa `dehydrate`/`hydrate` del core, **sin dependencia nueva**. Dos condiciones que no se pueden aflojar: `gcTime` ≥ la vigencia de lo persistido (con el default de 5 min lo rehidratado se recolecta al montar), y nada se pinta hasta rehidratar (montar antes dispara las queries contra la red).
- **Toasts propios**, sin librería. `ToastViewport` se monta una sola vez en `App.tsx` para que el toast sobreviva al cierre del modal que lo disparó.
- Los tokens neumórficos (`neu-raised`, `neu-pressed`, `neu-well`) son `@utility` en `src/index.css`. Usarlos, no reimplementar sombras. **Un elemento `neu-*` grande nunca debe ser el que scrollea** — scrollea un hijo sin sombra ni radio.

## Qué NO hace

- No conoce ninguna feature. Si un util necesita importar de `features/`, no va acá.
- No hay `local-db.ts`: el draft de captura importa `idb-keyval` directo.
