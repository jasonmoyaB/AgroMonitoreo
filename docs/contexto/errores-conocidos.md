# Errores conocidos

Trampas ya pisadas, cada una con su archivo. Todas salen de comentarios del código, de las migraciones o de `docs/`.

## Supabase / Postgres

**Migración sin `grant` → 403 solo en local.**
El proyecto hosteado da los permisos a `authenticated` por default invisible; `supabase db reset` los revoca. El esquema aplica limpio y `tsc` pasa, así que el síntoma es un 403 en dev sin nada roto a la vista. Toda migración que cree tabla lleva `grant ... to authenticated`.

**`SECURITY DEFINER` y el advisor.**
Postgres otorga EXECUTE a `PUBLIC` al crear la función: revocar solo de `anon` y `authenticated` deja el advisor prendido igual. Y el trigger de signup corre como `supabase_auth_admin`, así que a ese rol hay que devolverle el grant explícitamente.

**`max_rows = 1000` de PostgREST trunca en silencio.**
Traer la tabla entera de `registros_trabajo` cortaba apenas pasado el primer mes de uso, y los KPIs salían bajos sin ningún aviso. Acotar al rango pedido y paginar hasta que la base deje de devolver filas — ver `captura/services/registros-service.ts`.

**`.or()` no acepta parámetros.**
Recibe un string de filtro, así que `fincaId` terminaba interpolado sin escapar. Usar dos `.eq()` — ver `traslados/services/traslados-service.ts`.

**El generador de tipos marca un embed como array** cuando la unicidad es compuesta (ej. `asistencia` es única por `trabajador_id + fecha`, no por `trabajador_id`), aunque PostgREST devuelva un objeto único por ser FK muchos-a-uno. Ver `asistencia/services/asistencia-service.ts`.

**Advisor abierto que ninguna migración puede cerrar**: protección de contraseñas filtradas — es un toggle del Dashboard.

## Fechas (Costa Rica, UTC−6)

**`new Date().toISOString()` devuelve el día siguiente desde las 18:00 locales.**
Usar `shared/utils/fecha-local.ts`. Y sumarle un offset para compensar hace que "mañana" caiga en pasado mañana — no es el arreglo.

**El fin de un rango mensual es el día 1 del mes siguiente, no el 31.**
`'2026-02-31'` no es una fecha válida y Postgres rechaza el cast al comparar contra una columna `date`. Ver `hastaExclusivo` en `shared/utils/fecha-iso.ts`.

**Un mínimo de fecha calculado a nivel de módulo se congela.**
La PWA queda abierta de un día para el otro, y con el mínimo viejo se podían pedir traslados para fechas ya pasadas. Calcularlo en el render — ver `traslados/components/SolicitarTrasladoTrabajadoresStep.tsx`.

**Los tests fijan `TZ: 'America/Costa_Rica'`** en `vitest.config.ts`. Sin eso, un runner en UTC deja pasar en verde justo los tests de desfase horario.

## JavaScript / datos

**`Promise.all` corta en el primer rechazo** y deja sin reportar las escrituras que sí entraron. Usar `allSettled` + `traslados/utils/resumir-resultados.ts` para poder decir cuántas pasaron de verdad.

**Los inputs numéricos del admin aceptan cualquier cosa** — vacío, texto, negativos, `Infinity`. `shared/utils/leer-numero-no-negativo.ts` devuelve `null` cuando el valor no sirve, para que el llamador restaure el valor previo en vez de mandar `NaN` a la base.

**`toLocaleString('es-CR')` a secas pinta un salario en USD como si fueran colones.**
Formatear siempre con la moneda de la fila — ver `shared/utils/formatear-monto.ts`, que además cachea un `Intl.NumberFormat` por moneda porque construirlo es caro y se llama por cada celda de la planilla.

**Un PATCH completo pisa datos viejos.**
En la tabla de salarios cada control manda solo su campo: si el selector de moneda mandara también el salario leído de props desactualizadas, lo reescribiría. Ver `admin/services/salarios-service.ts`.

## UI

**El `header` fuera de la `<section overflow-y-auto>` queda pineado en mobile.**
Va adentro de la misma section que el contenido para que se suba con el scroll. Y `min-h-0` junto a `flex-1` es obligatorio o el scroll interno no funciona dentro del flex container. Ver `docs/RESPONSIVE.md`.

**El autofill del navegador rompe el look neumórfico** de los inputs; el workaround es un `box-shadow` inset en `src/index.css`. No borrarlo por parecer redundante.

**Un `setSuccess` inline se pierde** si el modal que lo muestra se cierra al guardar. Por eso el toast vive en `App.tsx` y sobrevive al desmontaje — ver `docs/instruccions/3-notificaciones-toast.md`.

## Tooling

**Worktrees de agentes con copias viejas de `test/`** hacían correr cada test dos veces, la mitad contra código que ya no existe. `vitest.config.ts` excluye `.claude/**`, `.agents/**` y `.amazonq/**`.

**Importar `vitest/config` dentro de `vite.config.ts` rompe `tsc -b`**: el proyecto compila con vite 8 pero pnpm le resuelve vite 7 a vitest, y se mezclan los dos juegos de tipos. Por eso hay dos configs separados.

## Deuda silenciosa

**`shared/constants/tipos-labor.constants.ts` duplica la tabla `labores`** y nada verifica que coincidan: se desincronizan sin que ningún test ni build se queje.

**`captura/utils/obtener-dias-en-mes.ts` lo usa `planilla` desde otra feature.** `fecha-iso.ts` ya se movió a `shared/utils/`; este quedó a medio camino. Moverlo también la próxima vez que se toque.

**`fincas.valor_hora` se guarda y se edita pero no lo lee ningún cálculo.** Es un campo huérfano a la espera de una regla de negocio.
