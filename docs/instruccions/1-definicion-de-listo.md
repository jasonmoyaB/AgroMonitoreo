# 1. Definicion de listo

Tarea lista SOLO cuando IA corre tests pnpm y todos pasan.

Chequeo obligatorio antes de dar por hecho, los cuatro en verde:

```bash
pnpm build                        # tsc -b && vite build, debe pasar sin error
pnpm lint                         # oxlint, debe pasar sin error
pnpm exec vitest run              # tests unitarios (viven en /test, espejando src/)
pnpm dlx react-doctor --verbose   # debe dar 100%
```

Ya **sí** hay test runner: vitest, con `vitest.config.ts` aparte de `vite.config.ts` a propósito (ver `docs/contexto/decisiones.md` 14). También existe el atajo `pnpm test`.

React Doctor por debajo de 100% → arreglar y reescanear, en loop. Si es falso positivo: verificar contra el código o el bundle real (no asumir), anotarlo en `.react-doctor/false-positives.md` y reescanear.

En CI corre **solo** React Doctor (`.github/workflows/react-doctor.yml`), en modo advisory: comenta pero no bloquea. Build, lint y tests son responsabilidad local.

Regla: archivos nuevos en `docs/instruccions/` empiezan con numero consecutivo (1-, 2-, 3-...).
