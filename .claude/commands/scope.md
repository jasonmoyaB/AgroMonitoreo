---
description: Clasifica una feature como F1 (MVP) o fase posterior. Guard de scope para AgroTrace.
argument-hint: descripción de la feature o idea
---

Evalúa si `$ARGUMENTS` entra en Fase 1 o debe diferirse.

## Proceso

1. Leer `docs/05-mvp-3-meses.md` (US-001–030, 5 componentes F1)
2. Leer `docs/09-prd-procesos.md` (P-01–P-21, mapa F1–F6)
3. Clasificar y responder en formato tabla

## Salida

| | |
|---|---|
| Feature | $ARGUMENTS |
| Fase | F1 / F2 / F3 / F4 / F5 / F6 |
| Proceso | P-XX o N/A |
| Veredicto | ✅ MVP / ⏳ Diferir |
| Razón | Una línea |

## Criterio F1 (MVP 3 meses)

Está en F1 si aparece en US-001–030 **O** es necesario para el flujo core:
> capataz registra aplicación → gerente ve dashboard → PDF cuaderno exportable

Todo lo demás → diferir. Si el usuario insiste → recordar el principio rector del proyecto:
> "Si en el día 90 el gerente no siente que ya no puede volver al Excel, fracasamos."
