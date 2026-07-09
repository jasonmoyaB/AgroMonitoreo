# Supply-chain: `workbox-build@7.4.1` → `@trickfilm400/rollup-plugin-off-main-thread`

**Fecha detección:** 2026-07-09
**Disparado por:** `pnpm add -D vitest` (instalación bloqueada por pnpm, no completada)
**Estado:** sin resolver — decisión pendiente del usuario

## Qué pasó

Al correr `pnpm add -D vitest`, pnpm abortó con:

```
ERR_PNPM_TRUST_DOWNGRADE  High-risk trust downgrade for
"@trickfilm400/rollup-plugin-off-main-thread@3.0.0-pre1" (possible package takeover)
```

No es bug del comando — es el chequeo de confianza de pnpm (basado en provenance attestation) deteniendo la resolución porque una dependencia transitiva perdió evidencia de confianza respecto a versión anterior.

## Cadena de dependencia

```
package.json (vite-plugin-pwa ^1.3.0)
  → vite-plugin-pwa@1.3.0
    → workbox-build@7.4.1
      → @trickfilm400/rollup-plugin-off-main-thread@^3.0.0-pre1
```

`vite-plugin-pwa` es dependencia real de producción (service worker PWA, ver CLAUDE.md sección "Data / persistence today" — capa de resiliencia junto a draft local y retry de mutación).

## Qué encontré investigando (todo vía `npm view`, sin instalar nada)

- `@surma/rollup-plugin-off-main-thread` (paquete original, Google/Surma) — última versión `2.2.3`, publicada **2021-11-02**. Abandonado, sin actividad hace ~5 años.
- `workbox-build@7.3.0` (2024-10-29) todavía dependía de `@surma/rollup-plugin-off-main-thread@^2.2.3` — normal.
- `workbox-build@7.4.1` (2026-05-04) cambió esa dependencia a `@trickfilm400/rollup-plugin-off-main-thread@^3.0.0-pre1` — scope npm distinto, no relacionado a `@surma`.
- `workbox-build` en sí sigue siendo el paquete legítimo de Google (`repository: googlechrome/workbox`, maintainers reales: gauntface, jeffposnick, addyosmani, etc.) — **no está comprometido el paquete workbox-build**, el problema es a quién eligieron como reemplazo de una dependencia abandonada.
- `@trickfilm400/rollup-plugin-off-main-thread`:
  - Un solo maintainer (`trickfilm400`), sin verificación adicional.
  - Repo GitHub bajo cuenta personal `Trickfilm400`, no `surma` ni `GoogleChromeLabs`.
  - Versión que usa `workbox-build` (`3.0.0-pre1`) es un **prerelease**, no una versión estable — se está usando como dependencia de producción de todos modos.
  - Sin attestation/provenance (`npm view ... dist.attestations` vacío).

Conclusión: no hay evidencia de que el paquete en sí tenga código malicioso ejecutado (no llegó a instalarse — verificado, `node_modules` no lo tiene), pero es un patrón de riesgo real: dependencia abandonada reemplazada por fork de un solo mantenedor no verificado, consumida por un paquete con mucha confianza (workbox-build/Google) sin que nadie lo haya cuestionado. Vale la pena tratarlo como no confiable hasta verificar más, no como confirmado malicioso.

## Impacto actual

- **No instalado.** `pnpm-lock.yaml` committeado (`1c6ffa3`) ya referencia esta dependencia en la sección `packages:`/`snapshots:`, pero `node_modules` local no la tiene materializada — la resolución nunca llegó a bajar el tarball.
- El lockfile committeado también tiene un bug de indentación (línea ~4032, entrada `minipass@7.1.3`) que pnpm reporta como "broken lockfile" y fuerza a re-resolver todo el árbol en cada install — separado de este issue de seguridad, pero relacionado: ese re-resolve es lo que dispara la resolución hacia `workbox-build@7.4.1`.

## Opciones (sin ejecutar ninguna todavía)

1. **Pin `vite-plugin-pwa` a `^1.1.0` o `1.0.0`** — ambas usan `workbox-build ^7.3.0`, que todavía depende de `@surma/...@2.2.3` (paquete original, abandonado pero sin señal de takeover). Downgrade de dependencia de producción real (PWA/service worker) — recomendable confirmar con user antes, puede perder fixes entre 1.1→1.3.
2. **`pnpm.overrides`** en `package.json` forzando `@trickfilm400/rollup-plugin-off-main-thread` a resolver como `npm:@surma/rollup-plugin-off-main-thread@2.2.3` — mantiene `vite-plugin-pwa@1.3.0`/`workbox-build@7.4.1` pero swap del paquete sospechoso por el original. Riesgo: `workbox-build@7.4.1` puede depender de API nueva de la v3 que `2.2.3` no tiene (no verificado, requiere build real para confirmar).
3. **Bypass** (`--config.minimum-release-age=0` ya usado, más forzar trust) — no recomendado sin auditar el código fuente del paquete primero.
4. **Instalar vitest por fuera del árbol raíz** (ej. workspace aislado) — evita el problema hoy pero no lo resuelve, dependencia sigue en `pnpm-lock.yaml` para cualquier install futuro.

## Siguiente paso

Pendiente decisión del usuario sobre opción 1 vs 2 antes de tocar `vite-plugin-pwa`/`pnpm-lock.yaml`. Setup de vitest (tema original de esta sesión) queda bloqueado hasta resolver esto, ya que `pnpm add` re-resuelve todo el lockfile.
