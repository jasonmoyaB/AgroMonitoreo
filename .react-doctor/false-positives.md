# React Doctor — verified false positives

## `react-doctor/no-impure-state-updater`

### `src/shared/components/NumericStepper.tsx:33-36`

```ts
if (value !== valorPrevio) {
  setValorPrevio(value)
  setTexto(String(value))
}
```

Not a functional `setState(prev => ...)` updater callback — there's no function passed to
either setter here. This is React's own documented "storing information from previous
renders" pattern (see react.dev's `useState` reference), used to reset the local text
buffer when the external `value` prop changes. Guarded by the equality check so it
terminates in one extra render; safe under StrictMode double-invocation since re-running
it computes the same values. Verified no other component calls this in a way that nests
it inside another setState updater.

### `src/features/asistencia/hooks/use-registrar-ausencia-calendario.ts:27-31`

```ts
function abrir(trabajadorSeleccionado: Trabajador) {
  setTrabajador(trabajadorSeleccionado)
  setFechas([])
  setError(null)
}
```

Plain event handler with three sequential `setState` calls — not a functional updater
passed to any setter. Identical shape to `limpiar()` three lines below it, which the
scanner does not flag. Traced the only call site (`AsistenciaScreen.tsx`, passed directly
as `onAgregar={calendarioModal.abrir}`) — it's never invoked from inside another
component's state-updater callback, so there's no nested/impure update happening.

## `react-doctor/artifact-baas-authority-surface`

### `dist/assets/index-*.js` (built bundle, source: `src/shared/lib/supabase-client.ts`)

`supabase-client.ts` uses `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase's anon/publishable
key, explicitly designed to be public and shipped in client bundles (Supabase's own docs
call it safe to expose). Column/field names like `rol_id`, `finca_id`, `activo` appear in
service files (`trabajadores-service.ts`, `usuario-service.ts`, etc.) because every table
those services touch is RLS-enforced server-side, not because the client trusts anything
it sends. Verified directly against migration files this session while building the admin
module: every table scoped by farm joins through `usuario` (`usuario.auth_user_id =
auth.uid() and usuario.finca_id = tabla.finca_id`), and role checks (`admin_oficina` vs
`supervisor`) added in `20260714165119_permitir_lectura_multi_finca_admin_oficina.sql` are
additive `exists (select ... from usuario join roles ...)` policies, not client-side
gates. The client-visible field names are not an authorization map an attacker can act on
without a matching Postgres role, since Postgres/RLS rejects any row that doesn't satisfy
the policy regardless of what the browser bundle reveals about column names.

## `react-doctor/no-barrel-import`

### `src/app/router.tsx` (imports from `../features/{admin,auth,captura,supervisor}`)

Every feature's `index.ts` is the deliberate public interface for that feature — CLAUDE.md's
Structure section documents each one explicitly (e.g. "the feature itself is headless
... the CRUD screen composes it", "`admin/index.ts`: export screens"), and `router.tsx` is
the one place all of them are meant to be assembled. Tried switching to direct
`../features/x/screens/YScreen` imports here: it silences this finding but flips 4 of
those `index.ts` files to a *different* real finding (`deslop/unused-file`, since
`router.tsx` was their only consumer) — trading one warning for four. `router.tsx` is
evaluated once at app boot (`createBrowserRouter` runs at module load, not per-render), so
the "slows page load" mechanism this rule targets doesn't apply the way it would inside a
frequently re-rendered component. Reverted to barrel imports; the `index.ts` files stay
reachable and doing their documented job.

## `react-doctor/js-length-check-first`

### `src/features/trabajadores/utils/validar-foto-trabajador.ts:20`

```ts
const coincideInicio = firma.every((byte, index) => encabezado[index] === byte)
```

Not a full-array-equality comparison the `a.length === b.length` guard is meant for —
`encabezado` is always a fixed 12-byte `Uint8Array` (`archivo.slice(0, 12)`, line 18) and
`firma` (a magic-byte signature, e.g. 4 bytes for PNG/JPEG) is intentionally *shorter*
than `encabezado`: this checks "does `encabezado` start with `firma`'s bytes", not "are
these two arrays equal." Adding a `firma.length === encabezado.length` guard would make
this always `false` (signatures are never 12 bytes) and break all photo upload validation.
Both arrays are also fixed-size (≤12 elements), so there's no real perf concern to guard
against either.

## `react-doctor/no-dynamic-import-path` and `react-doctor/async-await-in-loop`

### `dev-dist/sw.js`, `dev-dist/workbox-7e5eb42b.js`

Both are machine-generated: `sw.js` is written by `vite-plugin-pwa`'s dev-mode service
worker, `workbox-*.js` is Google's Workbox library bundled in verbatim. Neither is
authored code — editing either is overwritten on the next `pnpm dev` start, and the
Workbox file isn't ours to change regardless. Root-caused instead: `dev-dist/` is now in
`.gitignore` and untracked from git, so `react-doctor` (which "respects .gitignore" for
untracked files per its own `--help`) stops scanning it.
