# Specs

Una spec corta por módulo. Qué hace, qué reglas obliga, qué **no** hace.

No repiten lo que ya está en `docs/contexto/` — ahí va el porqué (`decisiones.md`), las trampas (`errores-conocidos.md`) y el mapa de archivos (`MAPA.md`). Acá va el contrato de cada módulo, para leer antes de tocarlo.

| Spec | Módulo |
|---|---|
| [auth.md](auth.md) | Login, recuperación, invitación, guard de rutas |
| [captura.md](captura.md) | El flujo del capataz en campo |
| [trabajadores.md](trabajadores.md) | CRUD de trabajadores, foto, métricas |
| [asistencia.md](asistencia.md) | Ausencias diarias, semana, calendario |
| [traslados.md](traslados.md) | Préstamo de un trabajador a otra finca |
| [perfil.md](perfil.md) | Datos propios del operador |
| [planilla.md](planilla.md) | Quincena, pago, liquidación |
| [supervisor.md](supervisor.md) | Shell del capataz + KPIs |
| [admin.md](admin.md) | Shell de oficina, fincas, supervisores |
| [shared.md](shared.md) | Lo transversal: PDF, KPIs, toasts, formato |

## Regla al editar una spec

Si cambiás código y la spec queda mintiendo, se corrige en el mismo PR. Una spec desactualizada es peor que ninguna.
