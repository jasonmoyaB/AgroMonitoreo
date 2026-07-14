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

## `react-doctor/no-dynamic-import-path` and `react-doctor/async-await-in-loop`

### `dev-dist/sw.js`, `dev-dist/workbox-7e5eb42b.js`

Both are machine-generated: `sw.js` is written by `vite-plugin-pwa`'s dev-mode service
worker, `workbox-*.js` is Google's Workbox library bundled in verbatim. Neither is
authored code — editing either is overwritten on the next `pnpm dev` start, and the
Workbox file isn't ours to change regardless. Root-caused instead: `dev-dist/` is now in
`.gitignore` and untracked from git, so `react-doctor` (which "respects .gitignore" for
untracked files per its own `--help`) stops scanning it.
