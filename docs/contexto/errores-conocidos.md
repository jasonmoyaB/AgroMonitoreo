# Errores conocidos

Trampas ya pisadas, cada una con su archivo. Todas salen de comentarios del código, de las migraciones o de `docs/`.

## Supabase / Postgres

**Migración sin `grant` → 403 solo en local.**
El proyecto hosteado da los permisos a `authenticated` por default invisible; `supabase db reset` los revoca. El esquema aplica limpio y `tsc` pasa, así que el síntoma es un 403 en dev sin nada roto a la vista. Toda migración que cree tabla lleva `grant ... to authenticated`.

**`SECURITY DEFINER` y el advisor.**
Postgres otorga EXECUTE a `PUBLIC` al crear la función: revocar solo de `anon` y `authenticated` deja el advisor prendido igual. Y el trigger de signup corre como `supabase_auth_admin`, así que a ese rol hay que devolverle el grant explícitamente.

**`revoke ... from public` no saca los grants de Supabase.**
Es la otra mitad del error de arriba, y muerde al revés. `20260709165032` y `20260714171722` revocaron de `public` creyendo que cerraban el tema, pero el ACL real seguía teniendo `anon=X` y `authenticated=X`: esos grants no vienen del pseudo-rol `PUBLIC` sino de los *default privileges* que Supabase aplica a toda función nueva en el schema `public`. Hay que revocar de `anon` y `authenticated` **por nombre**. Síntoma: el advisor sigue marcando 0028/0029 aunque la migración "ya lo arregló".

**A una función usada en una policy no se le puede quitar el EXECUTE.**
Las expresiones de una policy corren con los privilegios de quien consulta, así que `es_admin_oficina` necesita su grant a `authenticated` sí o sí. Para sacarla del advisor se la **mueve** a schema `private` (`20260803232810`), no se la revoca. Un trigger es el caso opuesto: no necesita EXECUTE del rol que dispara la sentencia, porque Postgres lo chequea al `create trigger`.

**Las policies siguen a la función al cambiar de schema, el plpgsql no.**
`alter function ... set schema` es transparente para `pg_policy` (guarda el OID), pero un cuerpo plpgsql resuelve el nombre en runtime: `evitar_escalada_privilegios_usuario` llamaba a `public.es_admin_oficina()` y había que repuntarlo a mano o reventaba al dispararse.

**Los 2 warnings de Auth del advisor están abiertos a propósito.**
`auth_leaked_password_protection` necesita plan Pro (la org está en Free) y `auth_insufficient_mfa_options` necesitaría además una pantalla de enrolamiento MFA, que no encaja con supervisores de campo con baja alfabetización. Ninguna migración los cierra: no perder tiempo buscándoles el fix en SQL.

**`max_rows = 1000` de PostgREST trunca en silencio.**
Traer la tabla entera de `registros_trabajo` cortaba apenas pasado el primer mes de uso, y los KPIs salían bajos sin ningún aviso. Acotar al rango pedido y paginar hasta que la base deje de devolver filas — ver `captura/services/registros-service.ts`.

**`.or()` no acepta parámetros.**
Recibe un string de filtro, así que `fincaId` terminaba interpolado sin escapar. Usar dos `.eq()` — ver `traslados/services/traslados-service.ts`.

**Un FK compuesto crea un segundo camino de embed y rompe PostgREST con `PGRST201`.**
`datos_trabajadores` tiene dos FK hacia `trabajadores`: `trabajador_id` y el compuesto `datos_trabajadores_finca_coincide` (que impide que `finca_id` se desincronice). Con dos caminos, `datos:datos_trabajadores(...)` deja de resolver y **la pantalla entera de trabajadores no carga**. Hay que nombrar el FK: `datos:datos_trabajadores!datos_trabajadores_trabajador_id_fkey(...)`.
Y tiene que ser **ese** FK. El hint de PostgREST ofrece los dos, pero por `finca_coincide` el embed vuelve **array** en vez de objeto: no da error, y `row.datos?.cedula` sobre un array es `undefined`, así que todas las cédulas quedan en `null` en silencio. Peor que el 400.
Segunda lección: esto **no lo ve `psql`**. La migración se verificó con SQL directo (constraints, RLS, índices, todo verde) y el bug igual llegó a la pantalla, porque `PGRST201` lo tira el resolutor de embeds de PostgREST. Si tocás un FK, probá con `curl` contra `/rest/v1/`.

**El generador de tipos marca un embed como array** cuando la unicidad es compuesta (ej. `asistencia` es única por `trabajador_id + fecha`, no por `trabajador_id`), aunque PostgREST devuelva un objeto único por ser FK muchos-a-uno. Ver `asistencia/services/asistencia-service.ts`.

**Los `content_path` de `config.toml` no se resuelven todos igual.**
`[auth.email.template.*]` (invite, recovery) van con `./supabase/templates/...`, relativos a la raíz. `[auth.email.notification.*]` (password_changed) va con `./templates/...`, relativo a `supabase/`. La inconsistencia parece un error de tipeo y no lo es: "normalizar" las tres al mismo prefijo hace que `supabase db reset` aborte antes de aplicar nada con `open supabase\supabase\templates\...: no se encuentra la ruta`.

**Advisor abierto que ninguna migración puede cerrar**: protección de contraseñas filtradas — es un toggle del Dashboard.

## Fechas (Costa Rica, UTC−6)

**`new Date().toISOString()` devuelve el día siguiente desde las 18:00 locales.**
Usar `shared/utils/fecha-local.ts`. Y sumarle un offset para compensar hace que "mañana" caiga en pasado mañana — no es el arreglo.

**El fin de un rango mensual es el día 1 del mes siguiente, no el 31.**
`'2026-02-31'` no es una fecha válida y Postgres rechaza el cast al comparar contra una columna `date`. Ver `hastaExclusivo` en `shared/utils/fecha-iso.ts`.

**Un mínimo de fecha calculado a nivel de módulo se congela.**
La PWA queda abierta de un día para el otro, y con el mínimo viejo se podían pedir traslados para fechas ya pasadas. Calcularlo en el render — ver `traslados/components/SolicitarTrasladoTrabajadoresStep.tsx`.

**Una regla de fecha que solo vive en el cliente no es una regla.**
"Un registro nunca lleva fecha futura" estaba solo en `captura/utils/ajustar-fecha-a-limites.ts`. `registros_trabajo.fecha` no tenia ningun check y la RLS solo mira `finca_id`, asi que un POST a `/rest/v1/registros_trabajo` con `'2030-01-01'` entraba: no es escalacion — el supervisor ya puede escribir en su finca — pero ensucia KPIs, tendencias y el rango de quincena con datos que ningun flujo de la app pudo generar. Cerrado con trigger en `20260819165307`. Y **trigger, no `check`**: `current_date` no es inmutable, y un check que la use hace fallar un `pg_restore` con filas que eran validas el dia que se escribieron.

**Los tests fijan `TZ: 'America/Costa_Rica'`** en `vitest.config.ts`. Sin eso, un runner en UTC deja pasar en verde justo los tests de desfase horario.

## JavaScript / datos

**`Promise.all` corta en el primer rechazo** y deja sin reportar las escrituras que sí entraron. Usar `allSettled` + `traslados/utils/resumir-resultados.ts` para poder decir cuántas pasaron de verdad.

**Los inputs numéricos del admin aceptan cualquier cosa** — vacío, texto, negativos, `Infinity`. `shared/utils/leer-numero-no-negativo.ts` devuelve `null` cuando el valor no sirve, para que el llamador restaure el valor previo en vez de mandar `NaN` a la base.

**`toLocaleString('es-CR')` a secas pinta un salario en USD como si fueran colones.**
Formatear siempre con la moneda de la fila — ver `shared/utils/formatear-monto.ts`, que además cachea un `Intl.NumberFormat` por moneda porque construirlo es caro y se llama por cada celda de la planilla.
Los números que **no** son dinero (horas, cantidades de producción, porcentajes de los dashboards) van por `shared/utils/formatear-cantidad.ts`, que topa en 1 decimal. Son dos utils a propósito: el de dinero necesita la moneda de la fila y el otro no debe pedirla.

**Un PATCH completo pisa datos viejos.**
En la tabla de salarios cada control manda solo su campo: si el selector de moneda mandara también el salario leído de props desactualizadas, lo reescribiría. Ver `admin/services/salarios-service.ts`.

## UI

**El `header` fuera de la `<section overflow-y-auto>` queda pineado en mobile.**
Va adentro de la misma section que el contenido para que se suba con el scroll. Y `min-h-0` junto a `flex-1` es obligatorio o el scroll interno no funciona dentro del flex container. Ver `docs/RESPONSIVE.md`.

**Un elemento con `neu-raised` no puede ser el que scrollea.**
La tarjeta del `Modal` ocupa casi toda la pantalla y era ella misma el `overflow-y-auto`. Con eso, cada frame de scroll obligaba al compositor de display a redibujar un render pass de pantalla completa con las dos sombras de 16px de blur y el clip de `rounded-[2rem]`: **34fps y `VizCompositorThread` 62% ocupado** en un trace real de Chrome desktop. El arreglo es que la tarjeta conserve sombra y radio pero no scrollee, y que scrollee un hijo sin sombra ni radio (`min-h-0 flex-1 overflow-y-auto`) — mide ~45% menos trabajo de compositor. Aplica a cualquier superficie `neu-*` grande que se vuelva scroller.

Dos trampas al diagnosticarlo, las dos me costaron una conclusión falsa:
- **`CrRendererMain` al 1% no significa "no hay problema de performance".** El costo estaba entero en `VizCompositorThread`, que es GPU/compositing, no JS. Mirar el reparto por hilo antes de culpar a React.
- **Headless no lo reproduce.** `chromium-headless-shell` rasteriza por CPU con SwiftShader y no ejecuta el render pass como Viz: medía "cero costo" para el mismo markup. Hay que medir con `channel: 'chrome'` y `headless: false`.

**El autofill del navegador rompe el look neumórfico** de los inputs; el workaround es un `box-shadow` inset en `src/index.css`. No borrarlo por parecer redundante.

**Un `setSuccess` inline se pierde** si el modal que lo muestra se cierra al guardar. Por eso el toast vive en `App.tsx` y sobrevive al desmontaje — ver `docs/instruccions/3-notificaciones-toast.md`.

## Tooling

**Worktrees de agentes con copias viejas de `test/`** hacían correr cada test dos veces, la mitad contra código que ya no existe. `vitest.config.ts` excluye `.claude/**`, `.agents/**` y `.amazonq/**`.

**Importar `vitest/config` dentro de `vite.config.ts` rompe `tsc -b`**: el proyecto compila con vite 8 pero pnpm le resuelve vite 7 a vitest, y se mezclan los dos juegos de tipos. Por eso hay dos configs separados.

## Deuda silenciosa

**`shared/constants/tipos-labor.constants.ts` duplica la tabla `labores`** y nada verifica que coincidan: se desincronizan sin que ningún test ni build se queje.

**Cambiar `valor_hora` no reescribe una quincena ya pagada, y está bien.** El pago congela `monto_bruto` y `dias_ausentes`, así que la fila pagada y la liquidación siguen mostrando lo de ese día. Si el descuento sale distinto al esperado, mirar primero si la fila ya tiene pago.

**`valor_hora_usd` en 0 no descuenta nada.** Es a propósito (`calcular-deduccion-ausencias.ts`): descontar 1750 *dólares* por hora sería peor que no descontar. Si un trabajador en USD aparece sin descuento pese a tener ausencias, falta cargar el valor hora en USD arriba de la tabla de `/admin/planilla`.
