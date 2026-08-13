# Flujo de trabajo

## Antes de escribir código

1. Buscar con el MCP **`codebase-memory`** (`search_graph`, `trace_path`, `get_code_snippet`, `get_architecture`, `query_graph`), no con Grep/Glob. Si el repo no está indexado: `index_repository`. Grep/Glob solo para texto plano, configs y archivos que no son código.
2. Ubicar el archivo con `MAPA.md`.
3. Chequear si ya existe: hook, service, util o query key que haga eso. Reusar antes de crear.

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
- `supabase db reset` (local, con Docker) para confirmar que la cadena entera sigue aplicando.
- `pnpm db:types` para regenerar `src/shared/types/supabase.types.ts`. Nunca editarlo a mano.
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

En CI corre solo React Doctor (`.github/workflows/react-doctor.yml`), en PRs y en push a `main`, y está en modo advisory: comenta pero **no bloquea**. Build, lint y tests son responsabilidad local.

## Deploy

- **Vercel** → `https://www.agromonitoreo.com` (dominio propio, comprado en Vercel; el apex redirige a `www`, y `agromonitoreo.vercel.app` sigue respondiendo). `vercel.json` solo tiene el rewrite SPA (`/(.*)` → `/index.html`).
- Envs de producción en Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` y `VITE_APP_URL`. Vite las hornea en **build time**: si faltan, el build no falla — la app pega a Supabase vacío en runtime, y los links de los correos de auth salen mal.
- La config de Auth del proyecto remoto (Site URL, Redirect URLs, SMTP, rate limits) va **por Dashboard, no por git**. `supabase/config.toml` solo aplica a `supabase start` local, y sus cambios requieren `supabase stop && supabase start`. Detalle y gotchas: `docs/instruccions/8-recuperacion-password-prod.md`.

`[PENDIENTE: no está documentado si el deploy a producción es automático por push a main o manual desde el dashboard de Vercel.]`

La URL canónica vive en 4 lugares que nadie valida entre sí: `APP_URL` (secret de la edge function `invitar-usuario`), `VITE_APP_URL` (Vercel), `Site URL` y `Redirect URLs` (Supabase Auth). Al cambiar de dominio hay que tocar los cuatro — ver `docs/instruccions/9-invitaciones-por-correo.md`.
