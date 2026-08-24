# Flujo de trabajo

## Antes de escribir código

1. Buscar con el MCP **`codebase-memory`** (`search_graph`, `trace_path`, `get_code_snippet`, `get_architecture`, `query_graph`), no con Grep/Glob. Si el repo no está indexado: `index_repository`. Grep/Glob solo para texto plano, configs y archivos que no son código.
2. Ubicar el archivo con `MAPA.md`.
3. Chequear si ya existe: hook, service, util o query key que haga eso. Reusar antes de crear.

## Arrancar el día

Dev corre contra el **stack local**, nunca contra producción. Con Docker Desktop abierto:

```bash
pnpm dev              # lee .env.development.local -> apunta al local
```

Eso es todo. **`supabase start` no es un paso diario**: los contenedores tienen `restart: unless-stopped`, así que vuelven solos cuando arranca Docker. Solo hace falta la primera vez, después de un `supabase stop` (que sí los elimina — los datos siguen en el volumen) o si alguno quedó caído. Con *Docker Desktop → Settings → General → "Start Docker Desktop when you sign in"* prendido, arrancar el día es abrir la máquina y `pnpm dev`.

La excepción es `supabase_edge_runtime`, con política `no`: no vuelve solo tras un reboot. Solo importa si se están sirviendo edge functions.

Si Docker está abajo, `pnpm dev` **levanta igual** y la app falla en cada query con un error de red que no dice por qué. Chequeo en un comando: `supabase status`, o `curl http://127.0.0.1:54321/rest/v1/`.

`.env.development.local` (URL + publishable key que imprime `supabase status`, `VITE_APP_URL=http://127.0.0.1:5173`) pisa a `.env.local` solo en mode `development`, porque Vite carga `.env` → `.env.local` → `.env.[mode]` → `.env.[mode].local` y gana el último. `pnpm build`, `pnpm preview` y Vercel corren en mode `production` y siguen leyendo `.env.local`, o sea producción. Para probar el dev server contra prod a propósito: `pnpm dev --mode production`.

Usuarios del seed: `admin@dev.local` / `capataz@dev.local`, password `Desarrollo123`. Studio en http://127.0.0.1:54323, correos en Mailpit http://127.0.0.1:54324.

Si el cambio toca la edge function `invitar-usuario`: `supabase functions serve invitar-usuario`, con `APP_URL=http://127.0.0.1:5173` en `supabase/functions/.env`. La invitación llega a Mailpit, no al correo real.

**El único momento en que se toca producción es `supabase db push`.** `db reset`, el seed y todo lo que se pruebe en `pnpm dev` viven en el volumen de Docker.

Y al revés: **`db push` no es parte del loop diario.** Va una vez, al final de la feature, para publicar migraciones — nunca con `--include-seed`, que empujaría `seed.sql` a producción (ver `errores-conocidos.md`). El loop de todos los días es `pnpm dev` y nada más.

## Hacer un cambio

- Rama por feature (el historial usa `Dashboard`, `RateLimit`, `Planilla`), PR a `main`.
- Poner el código en la capa que corresponde:
  - cálculo puro → `utils/` (y ahí es donde va el test)
  - acceso a Supabase → `services/`
  - estado, query, mutación → `hooks/`
  - render → `components/` o `screens/`
- Si el util tiene ramificación real, test en `/test` espejando la ruta de `src/`.
- Toast en todo `crear*` / `actualizar*` / cambio de estado de un hook `*-crud.ts`.
- Si tocaste las labores, sincronizar a mano `shared/constants/tipos-labor.constants.ts` con la tabla `labores`.

## Si el cambio toca la base

```bash
supabase migration new nombre_snake_case_espanol   # nunca inventar ni renombrar el timestamp
```

- Un cambio atómico por migración, envuelto en `begin;` / `commit;`.
- Si crea una tabla, **incluir siempre**: `grant select, insert, update, delete on table public.x to authenticated;` — sin eso el esquema aplica limpio y `tsc` pasa, pero la app 403ea en local.
- Nunca editar una migración ya aplicada; agregar una nueva.
- `supabase db reset` (local, con Docker) para confirmar que la cadena entera sigue aplicando. Reaplica también `supabase/seed.sql`, así que la base vuelve a quedar usable.
- `pnpm db:types` para regenerar `src/shared/types/supabase.types.ts`. Nunca editarlo a mano. Genera contra el stack local (`--local`), así que el stack tiene que estar arriba; si el único cambio del diff es el bloque `__InternalSupabase` / `PostgrestVersion`, es que el PostgREST local va atrás del remoto — descartar esa parte del diff, no commitearla.
- A remoto: `supabase db push`. **Nunca `db reset` contra remoto** (borra y recrea la base).

## Checklist de "terminado"

```bash
pnpm build              # tsc -b && vite build
pnpm lint               # oxlint
pnpm exec vitest run    # tests
pnpm dlx react-doctor --verbose   # debe dar 100%
```

- Los cuatro en verde. React Doctor por debajo de 100% → arreglar y reescanear, en loop. Si es falso positivo: verificar contra el código/bundle real (no asumir), anotarlo en `.react-doctor/false-positives.md` y reescanear.
- Fila nueva en `MAPA.md` si se agregó carpeta, feature, tabla o service.
- **pnpm siempre**, nunca `npm install`. `npm cache clean --force` no es una medida de seguridad ni una limpieza general.
- Publicar, **en este orden**: primero `supabase db push` si hubo migración, después el PR a `main` que despliega la app. Ver `## Deploy` — hay seis canales y `db push` es solo uno.

En CI corre solo React Doctor (`.github/workflows/react-doctor.yml`), en PRs y en push a `main`, y está en modo advisory: comenta pero **no bloquea**. Build, lint y tests son responsabilidad local.

## Deploy

**`supabase db push` no publica la app.** Sube las migraciones de esquema y nada más. "Subir a producción" son seis canales distintos, y cada cambio va por el suyo:

| Cambiaste | Sube con | Trampa |
|---|---|---|
| Código de la app (`src/`) | `git push` + PR a `main` → Vercel buildea y promueve solo | El PR además saca su propio preview deployment |
| Migraciones (`supabase/migrations/`) | `supabase db push` | De ida, sin rollback. `--dry-run` antes, siempre |
| Edge function (`supabase/functions/`) | `supabase functions deploy invitar-usuario` | No viaja ni con `db push` ni con el deploy de Vercel |
| Env vars (`VITE_*`) | Dashboard de Vercel | Vite las hornea en **build time**: guardarlas no alcanza, hay que redeployar |
| Auth: Site URL, Redirect URLs, SMTP, rate limits | Dashboard de Supabase, a mano | `config.toml` es **solo local**. Nunca `supabase config push`: empujaría `site_url = "http://127.0.0.1:5173"` a producción |
| Plantillas de correo (`supabase/templates/`) | Pegar a mano en Auth → Email Templates | Están versionadas, pero nada las sincroniza |
| `supabase/seed.sql` | **nunca** | El propio archivo aborta si detecta usuarios reales (`errores-conocidos.md`) |

**El orden importa: primero el esquema, después la app.** Si el código nuevo lee una columna que todavía no existe en producción, la app rompe en la ventana entre los dos deploys. Al revés es inofensivo: una columna que nadie lee todavía no molesta a nadie.

- El deploy de la app es **automático**: al mergear a `main`, Vercel buildea y promueve solo. No hay paso manual en el dashboard.
- **Vercel** → `https://www.agromonitoreo.com` (dominio propio, comprado en Vercel; el apex redirige a `www`, y `agromonitoreo.vercel.app` sigue respondiendo). `vercel.json` solo tiene el rewrite SPA (`/(.*)` → `/index.html`).
- Envs de producción en Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` y `VITE_APP_URL`. Vite las hornea en **build time**: si faltan, el build no falla — la app pega a Supabase vacío en runtime, y los links de los correos de auth salen mal.
- `VITE_HACIENDA_CONTRIBUYENTE_URL` es **opcional** y por eso no está en la lista de arriba: `shared/constants/hacienda.constants.ts` cae al registro público (`https://api.hacienda.go.cr/fe/ae`) cuando falta. Solo acepta overrides `https://`; con cualquier otra cosa revienta al cargar el módulo, a propósito. El default existe porque sin él la constante quedaba `undefined`, la consulta salía a una ruta **relativa**, y el rewrite SPA de `vercel.json` devolvía `index.html` con **200** — o sea `respuesta.ok` en true y un `SyntaxError` en el `.json()`, más la cédula escrita en el access log del sitio.
- La config de Auth del proyecto remoto (Site URL, Redirect URLs, SMTP, rate limits) va **por Dashboard, no por git**. `supabase/config.toml` solo aplica a `supabase start` local, y sus cambios requieren `supabase stop && supabase start`. Detalle y gotchas: `docs/instruccions/8-recuperacion-password-prod.md`.

La URL canónica vive en 4 lugares que nadie valida entre sí: `APP_URL` (secret de la edge function `invitar-usuario`), `VITE_APP_URL` (Vercel), `Site URL` y `Redirect URLs` (Supabase Auth). Al cambiar de dominio hay que tocar los cuatro — ver `docs/instruccions/9-invitaciones-por-correo.md`.
