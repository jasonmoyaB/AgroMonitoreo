# 1. Definicion de listo

Tarea lista SOLO cuando IA corre tests pnpm y todos pasan.

Chequeo obligatorio antes de dar por hecho:

```bash
pnpm build   # tsc -b && vite build, debe pasar sin error
pnpm lint    # oxlint, debe pasar sin error
```

No test runner separado hoy (ver CLAUDE.md). "Tests pnpm" = estos dos comandos verdes.

Regla: archivos nuevos en `docs/instruccions/` empiezan con numero consecutivo (1-, 2-, 3-...).
