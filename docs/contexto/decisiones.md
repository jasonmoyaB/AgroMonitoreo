# Decisiones técnicas

Formato: **qué se decidió → por qué → qué se descartó**. Todas están respaldadas por una migración, un archivo o un comentario del repo.

## Modelo de datos

**1. Aislamiento por `finca_id`, no por `organizacion_id`.**
El caso real es un dueño con varias fincas, no multi-tenancy. *Descartado*: el modelo multi-tenant de AgroTrace (otro proyecto; `CLAUDE.md` lo marca explícitamente para que no se mezclen).

**2. RLS siempre haciendo join a través de `usuario`.**
`usuario.auth_user_id = auth.uid() and usuario.finca_id = <tabla>.finca_id and usuario.activo = true`. *Descartado*: chequeo de columna suelta — no alcanza para saber quién es el que consulta. Evidencia: todas las policies de `supabase/migrations/`.

**3. El salario vive en `salarios_trabajadores`, no en columnas de `trabajadores`** (`20260728100100_mover_salarios_a_tabla_propia.sql`).
RLS es row-level: cualquier policy sobre `trabajadores` expone **todas** las columnas de las filas que alcanza. Y `trabajadores_select_activos_finca_o_admin` abre la tabla entera a propósito (traslados necesita listar trabajadores de otras fincas), mientras `trabajadores_update_finca_o_admin` deja escribir al supervisor. Mientras el salario estuvo ahí, ambas lo alcanzaban. *Descartado*: columnas en `trabajadores` — existieron (`20260727154626`) y se revirtieron. No volver a poner nada sensible ahí.

**3b. `asegurado` sí se queda en `trabajadores`, con el alcance de RLS aceptado a propósito** (`20260811165754`).
Es la única excepción a la regla de arriba y no es gratis: `trabajadores_select_activos_finca_o_admin` (su rama `activo = true` no tiene scoping de finca) hace este flag legible por supervisores de otras fincas, y `trabajadores_update_finca_o_admin` deja que el supervisor lo escriba. Ese write **se retiró del front**: el toggle salió de `TrabajadorForm` y `actualizarTrabajador` hace patch parcial sin la columna, así que hoy solo lo marca la oficina desde `/admin/trabajadores`. La policy sigue permitiéndolo — es superficie que quedó abierta, no una feature en uso. Se acepta porque es un bit del patrono, no PII variable del trabajador, y porque hoy existe una sola finca. Pero la lista de "no asegurados" es, en CR, la lista de incumplimientos ante la CCSS: **el día que entre una segunda finca con supervisor ajeno, mover la columna a tabla propia** siguiendo `20260728100100`. *Descartado*: `seguros_trabajadores` desde el día uno — una tabla, una policy y un join para un booleano que hoy nadie más lee.

**4. `pagos_quincenales` es un snapshot, no una vista sobre salarios** (`20260729163414`, `20260731185135`).
`monto`, `moneda`, `monto_bruto` y `dias_ausentes` se congelan en el momento del pago: si el admin sube el salario en agosto, cambia el valor hora o borra una ausencia, las quincenas de julio ya pagadas no se mueven — y la liquidación reimpresa sigue explicando el neto que imprimió. `monto_bruto` se guarda además de `dias_ausentes` porque el bruto no es reconstruible: `monto + dias × valor_hora × 8` deja de dar el original apenas cambia el valor hora. Sin policy de UPDATE ni DELETE, deliberadamente: una quincena pagada no se corrige editando el pasado, se corrige con un ajuste nuevo.

## Negocio

**5. El bruto de la quincena es `salario_mensual / 2`, ingresado a mano.**
No se deriva de horas ni de cantidad producida (regla confirmada con el usuario). Corte calendario 1–15 y 16–fin de mes, 24 pagos al año. El redondeo depende de la moneda: colones al entero, USD a dos decimales (`shared/utils/redondear-por-moneda.ts`, compartido con la deducción para que bruto − deducción siempre cierre). Evidencia: `shared/utils/calcular-monto-quincena.ts`, `planilla/utils/obtener-rango-quincena.ts`.

**5b. Las ausencias sí se descuentan, a `valor_hora × 8`** (`20260731185134`, `20260731185135`).
Un día ausente cuesta la jornada normal completa: `1750 × 8 = 14 000`. Cuentan **los tres tipos** (`vacaciones`, `permisos`, `permisos_medicos`), decisión explícita del usuario tras plantearle que en Costa Rica las vacaciones son tiempo pagado por ley y la incapacidad la cubre CCSS/INS. El descuento se aplica en la quincena donde cae la fecha, así que las dos quincenas del mes suman el mensual neto sin caso especial. El neto se topa en 0. Esto le dio consumidor a `fincas.valor_hora`, huérfano desde `20260727170000`. *Descartado*: mensual/30, mensual/días del mes y solo días laborables — el usuario definió el día como valor hora × jornada.

**5c. Dos valores hora por finca, uno por moneda** (`20260731185134`).
`valor_hora` es colones y `valor_hora_usd` dólares; se usa el que coincide con la moneda del salario del trabajador. `0` significa "sin definir" y no descuenta nada. *Descartado*: un solo valor hora con tipo de cambio — un valor que envejece y que alguien tiene que mantener a mano.

**5d. Los salarios no tienen pantalla propia: se editan dentro de `/admin/planilla`.**
`/admin/salarios` no existe. El salario mensual y la moneda son celdas editables de la fila (`admin/components/CeldasSalario.tsx`) y el valor hora de la finca vive arriba de esa misma tabla (`ValorHoraFinca.tsx`). El motivo es que ambos son entradas del mismo cálculo: `usePlanillaQuincena` expone `guardarSalario` e invalida su propia query, así que el monto de la quincena se recalcula sin navegar. *Descartado*: una pantalla `/admin/salarios` aparte — obligaba a ir y volver para ver el efecto del número que acabás de escribir.

**5e. Los dashboards agrupan por unidad de medida; cajas y tramos no se suman.**
`cosecha` se mide en cajas y las otras diez labores en tramos. La producción diaria, el ranking de labores y el de trabajadores sumaban las dos y rotulaban el total como **"unidades"** — un número que no era comparable con nada y que ninguna unidad honesta describía. Renombrar la etiqueta habría sido mentir mejor, así que se dejó de sumar: `shared/utils/kpis/construir-dashboard-por-unidad.ts` devuelve un `DashboardUnidad` por unidad presente en el mes, y `shared/components/DashboardPorUnidad.tsx` pinta un bloque completo por cada uno, con la unidad en cada título, en cada eje y en el hover de los gráficos. El orden de los bloques lo fija `tipos-labor.constants.ts`, no el orden en que llegaron los registros — si no, el dashboard se reordena según quién cargó primero ese mes.
Consecuencia en el PDF: `crearBlobPdf` pasó a aceptar varios streams y el dashboard sale **multipágina, una página por unidad** (las tarjetas de KPI solo en la primera). Los otros tres generadores siguen pasándole un `string` — el cambio es retrocompatible a propósito.
Un registro cuya labor no está en `tipos-labor.constants.ts` se descarta, igual que ya hacían `calcular-cantidades-por-unidad.ts` y el denominador de `calcular-horas-por-labor.ts`: sin unidad no hay bloque donde sumarlo, y contarlo en un lado y no en otro daría un dashboard que no cierra consigo mismo. El costo está anotado en `errores-conocidos.md`.
*Descartado*: renombrar "unidades" a algo más específico (el problema era el total, no la etiqueta); un selector de unidad que muestre una a la vez (esconde la mitad del mes detrás de un click, y el capataz no sabría que hay otra); y convertir todo a una unidad común, que no existe — una caja no son N tramos.

**6. Traslado de un día, sin acción de "devolución"** (`20260724173240`).
El préstamo vence solo por scoping de fecha. Un índice único parcial impide una segunda fila viva por trabajador+día. *Descartado*: un flujo explícito de retorno — más estado que mantener para nada.

**7. Un traslado resuelto queda congelado** (`20260728100200`).
`resolver_traslado_trabajador()` sella `resuelto_por`/`resuelto_en`, rechaza actualizar una fila ya resuelta, y fija `trabajador_id`, `fecha` y ambas fincas a sus valores originales: aprobar solo puede mover `estado`.

**8. Horas extra por umbral acumulado de 8h** (`docs/horas-extra.md`).
Suma de todas las labores del trabajador ese día, ordenadas por `creado_en`; extra cuando el acumulado supera estrictamente 8 (`>`, no `>=`). *Descartado*: marcar extra "por acción" (que el supervisor haya usado el flujo de agregar extra) — requeriría una columna `actualizado_en` en `registros_trabajo`.

## Seguridad

**9. El trigger de signup hardcodea rol y finca** (`20260708183000_no_confiar_rol_metadata_signup.sql`).
`crear_usuario_desde_auth()` nunca lee `raw_user_meta_data`: confiar en metadata del cliente era un agujero de escalación de privilegios. *Descartado*: signup self-serve de admin — se reemplazó por un runbook SQL manual (`docs/instruccions/7-crear-usuario-admin.md`), intencional porque la app tiene un solo dueño.

**9b. Alta de usuarios solo por invitación del admin** (`supabase/functions/invitar-usuario/`).
`enable_signup = false` en `[auth]` y `[auth.email]`, y el toggle equivalente apagado en el Dashboard del proyecto remoto. Borrar la pantalla `/registro` **no** era el control: sin ese flag, `POST /auth/v1/signup` seguía abierto y cualquiera se daba de alta con un curl. La UI solo dejó de ofrecerlo.
El invitar necesita `service_role`, que no puede vivir en el front → primera (y única) edge function del repo. Valida el JWT del llamador y que su fila de `usuario` sea `admin_oficina` **activo**; `verify_jwt` sola no alcanza porque un supervisor también tiene JWT válido. Después llama `auth.admin.inviteUserByEmail` con `redirectTo` al `/reset-password?invitacion=1`.
El trigger `crear_usuario_desde_auth()` no se tocó: la invitación inserta en `auth.users` igual que un signup, así que el invitado sigue naciendo `supervisor` y **ninguna metadata del cliente se lee** (misma razón que la decisión 9). La finca sí cambió después — ver 9d. Promover a `admin_oficina` sigue siendo la pantalla `/admin/supervisores`. *Descartado*: pedir rol y finca en el form de invitación (más UI y más superficie que auditar para una sola finca); y un endpoint en Vercel (`/api`), que obligaba a copiar el `service_role` a las env de Vercel, heredadas además por cada preview deployment.
`APP_URL` es secret de la función y es obligatorio: sin él el link cae al `Site URL`, y el invitado entraría con sesión activa a `/` **sin haber definido contraseña**.

**9c. Los correos los manda Supabase Auth vía SMTP de Resend, sin código.**
`inviteUserByEmail` usa el mismo pipeline SMTP y las mismas plantillas que la recuperación de contraseña: configurar `smtp.resend.com` en Auth → SMTP Settings arregla los dos flujos de una. El servicio default de Supabase topa en 2 emails/hora y solo entrega a miembros del proyecto — inservible para prod. *Descartado*: SDK de Resend, `react-email` o cualquier librería de mail; serían una dependencia nueva y un segundo camino de envío para el mismo correo.

**9d. El invitado nace sin finca; asignarla es un paso explícito del admin** (`20260817164409`).
`usuario.finca_id` perdió el `not null` y el `default 'birrisito'`, y el trigger dejó de pasar el literal. Antes la finca se inventaba por dos caminos a la vez — el default de la columna y el literal del trigger — y con una sola finca eso pasaba desapercibido: el invitado entraba directo a ver trabajadores, asistencia y traslados de Birrisito. Con dos fincas eso es un usuario dentro de la finca equivocada hasta que alguien lo note. *Descartado*: pedir la finca en el form de invitación (vuelve a poner en manos del cliente un dato que la decisión 9 sacó a propósito) y un default "finca de cortesía" (es el mismo bug con otro nombre).
No hizo falta tocar ninguna policy: todas comparan la finca del usuario contra `<tabla>.finca_id` (hoy vía `private.finca_del_usuario()`, `20260818184228`) y `null = 'x'` es null, no true. Verificado en local: sin finca, `registros_trabajo` y `asistencia` devuelven 0 filas, el insert en `trabajadores` lo rechaza la RLS y el update afecta 0 filas. **La excepción conocida es leer `trabajadores`**: `trabajadores_select_activos_finca_o_admin` tiene una rama `activo = true` sin scoping (traslados lo necesita), así que un usuario sin finca igual ve los nombres de los activos. No es nuevo ni es peor — le pasa a cualquier supervisor, y es estrictamente menos de lo que veía naciendo dentro de Birrisito.
El front lo corta en un solo lugar, `RouteGuard`, que muestra `SinFincaAsignada` (con botón de salir, para no dejar a nadie encerrado) en vez de dejar entrar a `/supervisor/*` o `/captura/*`. El admin no se ve afectado: elige finca a mano en cada pantalla, no depende de la propia.

**9e. La fecha futura la rechaza la base, con trigger y no con `check`** (`20260819165307`).
La regla vivía solo en el cliente (`captura/utils/ajustar-fecha-a-limites.ts`) y `registros_trabajo.fecha` no tenía ninguna restricción: un POST directo a PostgREST con `'2030-01-01'` entraba. No es escalación de privilegios — el supervisor ya puede escribir en su finca — pero mete en los KPIs, las tendencias y el rango de quincena datos que ningún flujo de la app pudo haber generado. *Descartado*: un `check (fecha <= current_date)` — `current_date` no es inmutable, Postgres no la acepta en un check, y aunque la aceptara haría fallar un `pg_restore` de filas que eran válidas el día que se escribieron. `security invoker` + `search_path` vacío, en schema `private`, como el resto.

**10. Los campos de auditoría los sella la base, no el cliente.**
`registrado_por` entra por default `usuario_actual_id()`; `actualizado_en` lo pone el trigger `tocar_actualizado_en()` (`20260729163414`). Antes lo mandaba `salarios-service.ts`. Mismo criterio que `resolver_traslado_trabajador()` y `crear_usuario_desde_auth()`.

**11. Bloqueo de cuenta por Auth Hook: intentado y revertido** (`20260715160413`).
El hook `password_verification_attempt` requiere plan Teams/Enterprise. *En su lugar*: cooldown de UX en el cliente (`auth/hooks/use-login-cooldown.ts`) más el rate limit por IP de GoTrue en `supabase/config.toml`.

**12. Grant explícito por tabla en cada migración.**
El proyecto hosteado otorga los permisos a `authenticated` por default invisible, pero `supabase db reset` los revoca en local. Sin el `grant`, el esquema aplica limpio y `tsc` pasa, pero la app 403ea en local. Solo a `authenticated`; ninguna policy le da nada a `anon`.

**12b. Schema `private` para los helpers `SECURITY DEFINER`** (`20260803232810`).
`public` lo expone PostgREST (`api.schemas` en `config.toml`), así que toda función ahí es llamable en `/rest/v1/rpc/<fn>` y el advisor la marca (0028/0029). A `es_admin_oficina` no se le puede revocar el EXECUTE: aparece en el `USING` de tres policies y esas expresiones corren con los privilegios de quien consulta. Se la mueve a `private`, que no está expuesto, con `grant usage on schema private to authenticated`. Es el patrón que recomiendan los propios docs de Supabase. Toda función lleva además `set search_path = ''` con el cuerpo calificado, para que no quede ningún schema escribible en la ruta de resolución. *Descartado*: revocar el EXECUTE (rompía las pantallas de admin) y pasarla a `SECURITY INVOKER` (existe justamente para cortar la recursión de RLS al subconsultar `usuario` dentro de una policy sobre `usuario`).

**12c. Los dos warnings de Auth quedan abiertos, a propósito.**
`auth_leaked_password_protection` requiere plan Pro y la org está en Free; `auth_insufficient_mfa_options` exigiría además construir el enrolamiento MFA, que no encaja con capataces de baja alfabetización. Activar MFA solo para silenciar el advisor sería teatro: nadie podría usarlo sin esa pantalla. Se revisa si algún día se sube a Pro.

**12c-bis. La protección de contraseñas filtradas sí se implementó, pero en el cliente.**
El toggle de Supabase sigue apagado (es Pro) y el advisor sigue en amarillo, pero la protección que describe ya corre: `auth/services/pwned-passwords-service.ts` consulta el rango de HaveIBeenPwned por **k-anonymity** — solo salen los primeros 5 caracteres del SHA-1, nunca la contraseña ni el hash completo — y `actualizarPassword` rechaza la que aparezca en filtraciones.
La guarda va en `auth-service.ts` y no en los dos hooks de formulario porque ese es el **único** lugar del repo que llama a `updateUser({ password })`: cubre de una `/reset-password`, la invitación y el cambio de contraseña del perfil. Los dos hooks ya pintan el `message` del error que atrapan, así que no hubo que tocar ni un componente.
**Falla abierto a propósito**: API caída, sin red, timeout de 4 s o `crypto.subtle` ausente (contexto inseguro) devuelven `false`. Un tercero caído no puede dejar a un invitado sin poder definir su contraseña; la validación sincrónica de `evaluar-requisitos-password.ts` sigue siendo el piso.
*Descartado*: subir a Pro solo por el toggle ($25/mes, aunque también traería Branching); y meter el chequeo en `validar-password.ts`, cuya firma es `string | null` sincrónica — una consulta de red no entra ahí. *No descartado pero fuera de alcance*: mostrarlo en vivo en `PasswordChecklist`, que dispararía un request por tecla.

**12d. Una policy por tabla y acción, y toda llamada a `auth.*` envuelta en `(select ...)`** (`20260818184228`).
Los advisors de performance marcaban 24 policies por `0003_auth_rls_initplan` (un `auth.uid()` suelto se re-evalúa por fila; envuelto, el planner lo resuelve como InitPlan una sola vez) y 11 pares por `0006_multiple_permissive_policies` (dos policies permissive para el mismo rol y acción corren las dos en cada fila). Las duplicadas se fusionaron con `or`, que da exactamente el mismo conjunto de filas: Postgres ya OR-eaba los `using` entre sí y los `with check` entre sí.
De paso el `EXISTS` correlacionado contra `usuario`, que estaba copiado en diez policies, pasó a `private.finca_del_usuario()` — simétrico a `private.es_admin_oficina()` (12b) y con las mismas garantías: schema `private` para que PostgREST no lo exponga, `security definer` para no volver a disparar la RLS de `usuario`, y `search_path` vacío con el cuerpo calificado. Devuelve `null` para el invitado sin finca, y `<tabla>.finca_id = null` es null, o sea false: mismo resultado que el `EXISTS`.
*Descartado*: dejar las policies duplicadas y silenciar solo el 0003 — el 0006 es el que se paga por fila cuando la tabla crece. Verificado contra remoto con `set local role authenticated` + `request.jwt.claims` para supervisor y admin: los conteos por tabla no se movieron y el insert cruzado de finca sigue rechazado.

## Infraestructura y dependencias

**13. Sistema de toasts propio, sin librería externa.**
Chico, vive en `shared/` (`toast-store.ts`, `Toast.tsx`, `ToastViewport.tsx` montado una sola vez en `App.tsx`). El toast sobrevive al cierre de cualquier modal, que era el problema real. Ver `docs/instruccions/3-notificaciones-toast.md`.

**13b. La base de desarrollo es el stack local de Docker, no un segundo proyecto hosteado.**
Hasta acá había una sola base y `pnpm dev` escribía en producción: probar una migración o resetear era tocar los datos reales de Birrisito. Se quiso un `AgroMonitoreoDev` hosteado, pero la cuota del plan Free es de **2 proyectos activos en total cruzando todas las orgs del dueño** (los pausados no cuentan), y ya están ocupados por AgroMonitoreo y OrganicoCR. La separación queda por env de Vite: `.env.development.local` apunta al local y solo lo carga mode `development`, así que pisa a `.env.local` en `pnpm dev` sin tocar `pnpm build` ni Vercel. Cero cambios en el código de la app — `shared/lib/supabase-client.ts` sigue leyendo las mismas dos vars.
*Descartado*: pausar OrganicoCR para liberar el cupo (deja un proyecto real offline, y en Free un proyecto pausado más de 90 días puede perder el backup) y subir a Pro por $25/mes, que además habilitaría Branching (rama de BD por PR) y la protección de contraseñas filtradas de 12c. Si algún día se paga Pro, Branching reemplaza a esto.
Los datos de prueba viven en `supabase/seed.sql`, versionado y sintético: nunca un dump de producción, que metería cédulas, teléfonos y salarios reales en la máquina de cualquiera que clone. Los trabajadores no se siembran ahí — ya los trae la migración `20260708171418`; el seed solo agrega los dos usuarios de auth, los montos y los registros.

**14. `vitest.config.ts` separado de `vite.config.ts`.**
vitest 3.2 declara `vite ^5||^6||^7` y pnpm le resuelve vite 7 mientras el proyecto compila con vite 8; importar `vitest/config` dentro de `vite.config.ts` mezcla ambos juegos de tipos y rompe `tsc -b`.

**15. Override de `@surma/rollup-plugin-off-main-thread@2.2.3` en `package.json`.**
Respuesta al trust downgrade de `workbox-build@7.4.1`, que cambió una dependencia abandonada de Google por un prerelease de un mantenedor personal sin attestation. Análisis completo: `docs/seguridad-supply-chain-workbox-build.md`. **Cerrado**: se tomó la opción 2 del doc (override en vez de bajar `vite-plugin-pwa`), y está aplicada en `package.json` — `@trickfilm400/rollup-plugin-off-main-thread` resuelve a `npm:@surma/rollup-plugin-off-main-thread@2.2.3`. `pnpm build` pasa con `vite-plugin-pwa@1.3.0`, así que el temor de que `workbox-build@7.4.1` usara API de la v3 no se materializó.

**16. Paginación explícita en `captura/services/registros-service.ts`.**
PostgREST corta cada respuesta en `max_rows` (1000): traer la tabla entera truncaba en silencio apenas pasado el primer mes de uso, y los KPIs salían bajos sin ningún aviso. Se acota al mes pedido y se pagina hasta que la base deja de devolver filas.

**17. Captura sin señal con el cache persistido de TanStack Query, sin dependencia nueva.**
Antes eran tres capas — draft local con debounce de 300ms, `retry: 3` y el service worker — y **no alcanzaban**. Con `networkMode: 'online'` (el default de v5) una mutación sin conexión no falla: queda *pausada*, así que `onSuccess` nunca corría y la pantalla no reaccionaba al tocar Confirmar. Peor: sin red `useTrabajadoresDisponibles` devolvía vacío y `CapturaRegistroScreen` hacía `return null`, o sea que la pantalla ni se pintaba. El banner de offline prometía algo que solo era cierto para el draft de una pantalla ya abierta.
El arreglo es persistir el cache entero en IndexedDB (`shared/lib/persistencia-query.ts` + `shared/hooks/use-cache-persistente.ts`): las lecturas sobreviven a quedarse sin señal y a un reload, y `dehydrate` incluye por default las mutaciones pausadas, que `resumePausedMutations()` reenvía al reconectar. El `mutationFn` vive en `setMutationDefaults` (`src/app/query-client.ts`) y no en el hook, porque una mutación rehidratada no trae función: sin ese default no habría qué reanudar. La escritura optimista sobre la cache del día es parte del arreglo, no un extra — sin ella la grid no pinta el check verde y el capataz recarga al mismo trabajador.
Dos condiciones que no se pueden aflojar: `gcTime` ≥ la vigencia de lo persistido (con el default de 5 min lo rehidratado se recolecta apenas monta y persistir no sirve de nada), y no pintar nada hasta rehidratar (montar antes dispara las queries contra la red y la app arranca vacía justo cuando el cache la salvaba).
*Descartado*: `@tanstack/react-query-persist-client`, que es el camino documentado. La instalación la frena `trust-policy=no-downgrade` de pnpm por `semver@6.3.1` (transitivo de `workbox-build`, **ya presente en el lockfile**: no es exposición nueva, pero `pnpm add` re-resuelve el árbol y el guard salta). `dehydrate`/`hydrate`/`resumePausedMutations` ya vienen en `@tanstack/react-query`, así que el paquete solo aportaba ergonomía: se hizo a mano en ~50 líneas y la política de la máquina queda intacta. También *descartado*: una cola de mutaciones propia — reimplementar lo que el cliente de queries ya hace.
Sigue **sin ser offline-first**: no hay base local ni resolución del lado del dispositivo, solo sobrevive lo que ya se había leído.

**18. La agregación de KPIs en el servidor queda diferida, con umbral escrito.**
Hoy los tres dashboards bajan el mes entero de `registros_trabajo` y suman en JS. Agregarlo en Postgres colapsaría ~10 000 filas a ~150, pero hay que soltar dimensiones — son tres agregados distintos (`fecha+unidad`, `tipo_labor_id`, `trabajador_id+unidad`), porque la tabla ya está al grano `(trabajador, labor, fecha)` por su unique y un `group by` sobre esas tres columnas no colapsa nada. El costo real no es el SQL: es **duplicar en la base la regla de unidad** que hoy vive en `tipos-labor.constants.ts` — que ya es deuda por duplicar la tabla `labores` — y reescribir los tres hooks con sus utils y tests.
Con la consulta acotada por finca (decisión 16 extendida: `listarRegistrosDelMes` acepta `fincaId` y el dashboard por finca dejó de filtrar en el cliente), una finca son ~10 000 filas/mes ≈ 1 MB. Se aguanta. **Gatillo para hacerlo**: un mes real supera ~30 000 filas, o el fetch del dashboard pasa de 1 s.
*Descartado por ahora*: hacerlo ya — sería pagar la duplicación de la regla de unidad antes de que el volumen la justifique.
