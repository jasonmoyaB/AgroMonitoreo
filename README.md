# AgroMonitoreo

PWA (React + TypeScript) reemplaza planilla Excel (`docs/mano de obra.xlsx`) pa' registro diario mano de obra en finca **Birrisito** (Costa Rica).

## Problema

Capataz anota a mano: trabajador, labor, horas, cantidad producida. Productividad (cantidad/horas) calculada manual en Excel. Lento, error-prone, sin foto ni respaldo.

## Solución

App captura (`features/captura`) pa' capataz en campo:

- Grid iconos, sin texto libre (muchos trabajadores baja alfabetización)
- Touch targets grandes (≥88px), steppers +/- pa' números (nunca teclado)
- Flujo: elegir labor → elegir trabajador (foto/iniciales, check verde si ya cargado hoy) → horas + cantidad → confirmar
- App calcula productividad sola

Backend real ya: Supabase (Postgres + Auth + RLS + Storage), aislamiento por `finca_id`. Únicos IndexedDB hoy: draft en progreso (resiliencia, no fuente verdad).

Resiliente a caída conexión: autosave local (300ms debounce) + retry mutación (3x) + service worker PWA.

## Roles

- **supervisor/capataz**: carga datos campo, gestión trabajadores (`features/trabajadores`), asistencia diaria (`features/asistencia`), traslados entre fincas (`features/traslados`), perfil propio (`features/perfil`), KPIs (`features/supervisor`)
- **admin/oficina**: implementado (`features/admin`) — dashboards, CRUD fincas, CRUD supervisores, trabajadores/asistencia multi-finca, planilla quincenal (los salarios se editan adentro, no hay `/admin/salarios`), traslados

No hay signup público: el admin invita por correo desde `/admin/supervisores`. El invitado nace `supervisor` y **sin finca**; hasta que el admin se la asigne ve la pantalla `SinFincaAsignada`.

Flujo un sentido: supervisor → admin. Sin flujo reverso.

## Lo logrado (recién)

- **Alta solo por invitación**: `enable_signup = false` y edge function `invitar-usuario` (única del repo, es la que tiene el `service_role`). Correos por SMTP de Resend. El invitado nace `supervisor` sin finca; asignarla es un paso explícito del admin
- **Salarios y planilla**: salario mensual por trabajador (`usd`/`colones`), quincena = mitad, editable en la propia fila de `/admin/planilla`. Valor hora por finca en colones y en USD (`fincas.valor_hora`, `valor_hora_usd`): fija el costo del día ausente (valor hora × 8). El pago congela `monto`, `moneda`, `monto_bruto` y `dias_ausentes` — subir un salario después no reescribe lo ya pagado
- **Ausencias en planilla**: cada ausencia de la quincena descuenta un día del monto. Cuentan los tres tipos; el neto nunca baja de 0
- **Datos personales**: cédula, fecha de ingreso y teléfono del trabajador en tabla propia `datos_trabajadores` (PII fuera de `trabajadores`, misma razón que el salario); datos del propio usuario en columnas de `usuario`. La cédula autocompleta el nombre contra la API pública de Hacienda
- **Traslados**: préstamo de trabajador entre fincas por un día (pendiente/aprobado/rechazado), sin devolución manual — vence por fecha. Badges en origen y destino
- **Auth hardening**: cooldown de login tras intentos fallidos, recuperación de password en producción, rol y finca hardcodeados server-side (nunca se lee metadata del cliente)
- **Módulo Admin completo**: dashboard rollup + por finca, CRUD fincas/supervisores, trabajadores y asistencia por finca
- **Asistencia**: marcar ausente/presente, tabla semanal, calendario mensual, export PDF
- **PDFs con sistema de diseño propio**: motor `shared/lib/pdf-doc.ts` + tokens/estilos/tabla en `shared/utils/pdf/`, sin librería externa. Reglas en `docs/PATRONES-DISENO-PDF.md`, con test de área segura
- **Métricas/KPIs**: horas extras (`docs/horas-extra.md`), ranking labores/trabajadores, producción diaria y horas por labor — `shared/utils/kpis/`, compartidos por los 3 dashboards
- **Supabase hardening**: grants explícitos por tabla, scoping por `private.finca_del_usuario()`, helpers `SECURITY DEFINER` en schema `private` (fuera de PostgREST), policies fusionadas a una por tabla+acción, y la fecha futura de `registros_trabajo` rechazada por trigger y no solo por el cliente
- 351 tests con vitest en 60 archivos (`/test`, espejo de `src/`), MCP `codebase-memory` pa' navegar el repo

## Stack

React + TypeScript + Vite, Tailwind v4, TanStack Query, Zustand, Supabase (Postgres+Auth+RLS+Storage).

## Comandos

Package manager: **pnpm solo** (no npm/yarn).

```bash
pnpm install          # deps
pnpm dev              # dev server
pnpm build            # typecheck + build, debe pasar
pnpm exec tsc -b --noEmit   # solo typecheck
pnpm exec vitest run  # tests (o `pnpm test`)
pnpm lint             # oxlint
pnpm db:types         # regenerar src/shared/types/supabase.types.ts tras una migracion
pnpm preview          # preview build prod

pnpm dlx react-doctor --verbose   # debe dar 100%
```

Los de `supabase`, con lo unico que importa saber de cada uno — **contra que base corre**:

| Comando | Toca | Cuando |
|---|---|---|
| `pnpm dev` | local | **el loop diario, esto es todo** |
| `supabase start` | local | primera vez, o despues de un `supabase stop` |
| `supabase db reset` | local | tras escribir una migracion; reaplica la cadena entera + `seed.sql` |
| `pnpm db:types` | local (lee) | tras una migracion |
| `supabase status` | local | ver si el stack esta arriba, y sacar la publishable key |
| `supabase stop` | local | solo para liberar RAM; borra los contenedores, los datos quedan en el volumen |
| `supabase db push` | **PRODUCCION** | una vez, al terminar la feature, para publicar migraciones |
| `supabase db reset --linked` | **PRODUCCION** | nunca: borra y recrea la base |

`supabase db restart` **no existe** (los subcomandos de `db` son `reset` y `start`).

**Nunca** `supabase db push --include-seed` ni `supabase db reset --linked`: los dos corren
`supabase/seed.sql` contra produccion. El seed tiene un freno que aborta si detecta usuarios
reales, pero no es excusa para tirarlos.

### Subir cambios a produccion

`supabase db push` **no** publica la app: sube el esquema y nada mas. Cada cosa va por su canal:

| Cambiaste | Sube con |
|---|---|
| Codigo de la app (`src/`) | `git push` + PR a `main` → Vercel buildea y promueve solo |
| Migraciones (`supabase/migrations/`) | `supabase db push` |
| Edge function (`supabase/functions/`) | `supabase functions deploy invitar-usuario` |
| Env vars (`VITE_*`) | Dashboard de Vercel + redeploy (Vite las hornea en build time) |
| Auth: Site URL, SMTP, rate limits, plantillas | Dashboard de Supabase, a mano — `config.toml` es solo local |
| `supabase/seed.sql` | nunca |

**Orden: primero el esquema, despues la app.** Al reves, el codigo nuevo lee una columna que
todavia no existe en prod. Detalle y trampas de cada canal: `docs/contexto/flujo-de-trabajo.md`.

## Dos bases: prod hosteada, dev local

Hay **un solo** proyecto Supabase hosteado y es produccion. La base de desarrollo es el
stack local en Docker, desechable.

**Una sola vez** (o despues de un `supabase stop`):

```bash
supabase start        # Postgres + Auth + Storage en 127.0.0.1:54321
supabase db reset     # migraciones desde cero + supabase/seed.sql
```

**Cada dia**, con Docker Desktop abierto:

```bash
pnpm dev              # apunta al stack local, no a prod
```

`supabase start` **no** va todos los dias: los contenedores tienen `restart: unless-stopped`,
asi que vuelven solos cuando arranca Docker. Prendiendo *Settings -> General -> Start Docker
Desktop when you sign in*, arrancar el dia es abrir la maquina y `pnpm dev`, sin comandos.

`supabase stop` si elimina los contenedores (los datos quedan en el volumen de docker):
para volver, `supabase start`.

Usuarios del seed: `admin@dev.local` y `capataz@dev.local`, password `Desarrollo123`.
Studio local en http://127.0.0.1:54323 y los correos en Mailpit, http://127.0.0.1:54324
(no salen a internet).

Sin Docker se puede correr el dev server contra **produccion**: `pnpm dev --mode production`.
Escotilla para una demo o un dia que Docker no arranque — es leer y escribir en prod.

No se creo un segundo proyecto hosteado porque la cuota del plan free es de 2 proyectos
en total cruzando todas las orgs, y ya estan ocupados.

## Variables de entorno

Dos archivos, ninguno versionado (`.gitignore` tapa `.env*`):

| Archivo | Cuando lo carga Vite | A que apunta |
|---|---|---|
| `.env.local` | siempre | **produccion** |
| `.env.development.local` | solo `pnpm dev` (mode `development`) | **stack local** |

Vite carga `.env` -> `.env.local` -> `.env.[mode]` -> `.env.[mode].local` y gana el ultimo,
asi que `.env.development.local` pisa a `.env.local` en dev y no toca ni `pnpm build` ni
Vercel. Para correr el dev server contra produccion: `pnpm dev --mode production`.

`.env.local` (produccion):

```bash
VITE_SUPABASE_URL=https://<proyecto>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key>
VITE_APP_URL=http://localhost:5173        # base de los links de los correos de auth
```

`.env.development.local` (local; la key la imprime `supabase status`):

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key local>
VITE_APP_URL=http://127.0.0.1:5173
```

`VITE_HACIENDA_CONTRIBUYENTE_URL` es opcional: sin ella se usa el registro publico de Hacienda. Solo acepta `https://`.

Vite hornea estas vars en **build time** -> cambiarlas exige rebuild, no basta reiniciar.

**Nunca** el `service_role` en el front. Vive como secret de la edge function `invitar-usuario`.

## Deploy

Vercel -> **https://www.agromonitoreo.com** (el apex redirige a `www`). `vercel.json` solo tiene el rewrite SPA.

Las mismas 3 vars van en Vercel (production + preview). La config de Auth de Supabase (Site URL, Redirect URLs, SMTP) va **por Dashboard, no por git**: `supabase/config.toml` solo aplica a `supabase start` local. Detalle: `docs/instruccions/8-recuperacion-password-prod.md`.

## Estructura

Ver `CLAUDE.md` pa' detalle arquitectura, capas, backend Supabase, y convenciones.
