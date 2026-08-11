# Decisiones técnicas

Formato: **qué se decidió → por qué → qué se descartó**. Todas están respaldadas por una migración, un archivo o un comentario del repo.

## Modelo de datos

**1. Aislamiento por `finca_id`, no por `organizacion_id`.**
El caso real es un dueño con varias fincas, no multi-tenancy. *Descartado*: el modelo multi-tenant de AgroTrace (otro proyecto; `CLAUDE.md` lo marca explícitamente para que no se mezclen).

**2. RLS siempre haciendo join a través de `usuario`.**
`usuario.auth_user_id = auth.uid() and usuario.finca_id = <tabla>.finca_id and usuario.activo = true`. *Descartado*: chequeo de columna suelta — no alcanza para saber quién es el que consulta. Evidencia: todas las policies de `supabase/migrations/`.

**3. El salario vive en `salarios_trabajadores`, no en columnas de `trabajadores`** (`20260728100100_mover_salarios_a_tabla_propia.sql`).
RLS es row-level: cualquier policy sobre `trabajadores` expone **todas** las columnas de las filas que alcanza. Y `trabajadores_select_activos_multi_finca` abre la tabla entera a propósito (traslados necesita listar trabajadores de otras fincas), mientras `trabajadores_update_own_finca` deja escribir al supervisor. Mientras el salario estuvo ahí, ambas lo alcanzaban. *Descartado*: columnas en `trabajadores` — existieron (`20260727154626`) y se revirtieron. No volver a poner nada sensible ahí.

**3b. `asegurado` sí se queda en `trabajadores`, con el alcance de RLS aceptado a propósito** (`20260811165754`).
Es la única excepción a la regla de arriba y no es gratis: `trabajadores_select_activos_multi_finca` (`using (activo = true)`, sin scoping de finca) hace este flag legible por supervisores de otras fincas, y `trabajadores_update_own_finca` deja que el supervisor lo escriba — eso último es la feature pedida, no un agujero. Se acepta porque es un bit del patrono, no PII variable del trabajador, y porque hoy existe una sola finca. Pero la lista de "no asegurados" es, en CR, la lista de incumplimientos ante la CCSS: **el día que entre una segunda finca con supervisor ajeno, mover la columna a tabla propia** siguiendo `20260728100100`. *Descartado*: `seguros_trabajadores` desde el día uno — una tabla, una policy y un join para un booleano que hoy nadie más lee.

**4. `pagos_quincenales` es un snapshot, no una vista sobre salarios** (`20260729163414`, `20260731185135`).
`monto`, `moneda`, `monto_bruto` y `dias_ausentes` se congelan en el momento del pago: si el admin sube el salario en agosto, cambia el valor hora o borra una ausencia, las quincenas de julio ya pagadas no se mueven — y la liquidación reimpresa sigue explicando el neto que imprimió. `monto_bruto` se guarda además de `dias_ausentes` porque el bruto no es reconstruible: `monto + dias × valor_hora × 8` deja de dar el original apenas cambia el valor hora. Sin policy de UPDATE ni DELETE, deliberadamente: una quincena pagada no se corrige editando el pasado, se corrige con un ajuste nuevo.

## Negocio

**5. El bruto de la quincena es `salario_mensual / 2`, ingresado a mano.**
No se deriva de horas ni de cantidad producida (regla confirmada con el usuario). Corte calendario 1–15 y 16–fin de mes, 24 pagos al año. El redondeo depende de la moneda: colones al entero, USD a dos decimales (`shared/utils/redondear-por-moneda.ts`, compartido con la deducción para que bruto − deducción siempre cierre). Evidencia: `shared/utils/calcular-monto-quincena.ts`, `planilla/utils/obtener-rango-quincena.ts`.

**5b. Las ausencias sí se descuentan, a `valor_hora × 8`** (`20260731185134`, `20260731185135`).
Un día ausente cuesta la jornada normal completa: `1750 × 8 = 14 000`. Cuentan **los tres tipos** (`vacaciones`, `permisos`, `permisos_medicos`), decisión explícita del usuario tras plantearle que en Costa Rica las vacaciones son tiempo pagado por ley y la incapacidad la cubre CCSS/INS. El descuento se aplica en la quincena donde cae la fecha, así que las dos quincenas del mes suman el mensual neto sin caso especial. El neto se topa en 0. Esto le dio consumidor a `fincas.valor_hora`, huérfano desde `20260727170000`. *Descartado*: mensual/30, mensual/días del mes y solo días laborables — el usuario definió el día como valor hora × jornada.

**5c. Dos valores hora por finca, uno por moneda** (`20260731185134`).
`valor_hora` es colones y `valor_hora_usd` dólares; se usa el que coincide con la moneda del salario del trabajador. `0` significa "sin definir" y no descuenta nada. *Descartado*: un solo valor hora con tipo de cambio — un valor que envejece y que alguien tiene que mantener a mano.

**6. Traslado de un día, sin acción de "devolución"** (`20260724173240`).
El préstamo vence solo por scoping de fecha. Un índice único parcial impide una segunda fila viva por trabajador+día. *Descartado*: un flujo explícito de retorno — más estado que mantener para nada.

**7. Un traslado resuelto queda congelado** (`20260728100200`).
`resolver_traslado_trabajador()` sella `resuelto_por`/`resuelto_en`, rechaza actualizar una fila ya resuelta, y fija `trabajador_id`, `fecha` y ambas fincas a sus valores originales: aprobar solo puede mover `estado`.

**8. Horas extra por umbral acumulado de 8h** (`docs/horas-extra.md`).
Suma de todas las labores del trabajador ese día, ordenadas por `creado_en`; extra cuando el acumulado supera estrictamente 8 (`>`, no `>=`). *Descartado*: marcar extra "por acción" (que el supervisor haya usado el flujo de agregar extra) — requeriría una columna `actualizado_en` en `registros_trabajo`.

## Seguridad

**9. El trigger de signup hardcodea rol y finca** (`20260708183000_no_confiar_rol_metadata_signup.sql`).
`crear_usuario_desde_auth()` nunca lee `raw_user_meta_data`: confiar en metadata del cliente era un agujero de escalación de privilegios. *Descartado*: signup self-serve de admin — se reemplazó por un runbook SQL manual (`docs/instruccions/7-crear-usuario-admin.md`), intencional porque la app tiene un solo dueño.

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

## Infraestructura y dependencias

**13. Sistema de toasts propio, sin librería externa.**
Chico, vive en `shared/` (`toast-store.ts`, `Toast.tsx`, `ToastViewport.tsx` montado una sola vez en `App.tsx`). El toast sobrevive al cierre de cualquier modal, que era el problema real. Ver `docs/instruccions/3-notificaciones-toast.md`.

**14. `vitest.config.ts` separado de `vite.config.ts`.**
vitest 3.2 declara `vite ^5||^6||^7` y pnpm le resuelve vite 7 mientras el proyecto compila con vite 8; importar `vitest/config` dentro de `vite.config.ts` mezcla ambos juegos de tipos y rompe `tsc -b`.

**15. Override de `@surma/rollup-plugin-off-main-thread@2.2.3` en `package.json`.**
Respuesta al trust downgrade de `workbox-build@7.4.1`, que cambió una dependencia abandonada de Google por un prerelease de un mantenedor personal sin attestation. Análisis completo: `docs/seguridad-supply-chain-workbox-build.md`.
`[PENDIENTE: ese doc todavía dice "sin resolver — decisión pendiente del usuario", pero el override ya está aplicado. Confirmar si eso cierra el tema y actualizar el estado del doc.]`

**16. Paginación explícita en `captura/services/registros-service.ts`.**
PostgREST corta cada respuesta en `max_rows` (1000): traer la tabla entera truncaba en silencio apenas pasado el primer mes de uso, y los KPIs salían bajos sin ningún aviso. Se acota al mes pedido y se pagina hasta que la base deja de devolver filas.

**17. Resiliencia en tres capas, no offline-first.**
Draft local con debounce de 300ms + mutación optimista con `retry: 3` + service worker de la PWA. *Descartado*: arquitectura offline-first — normalmente hay wifi y no justifica el costo.
