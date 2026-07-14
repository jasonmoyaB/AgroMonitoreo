# Horas extra — regla de calculo

Modal `/supervisor/trabajadores` -> click trabajador -> indicador "Hizo horas extra".

## Regla

No es por labor sola. Es **suma de todas las labores del trabajador ese dia**.

1. Por cada `fecha`, ordenar sus `registros_trabajo` por `creado_en` (orden de carga en la app).
2. Sumar `horas` acumulado en ese orden.
3. Cuando acumulado **supera** `JORNADA_NORMAL_HORAS` (8, estrictamente `>`, no `>=`) -> esa fila y las siguientes de ese dia quedan marcadas "extra".

Umbral: `src/features/supervisor/constants/trabajador-metricas.constants.ts` -> `JORNADA_NORMAL_HORAS = 8`.

## Ejemplo real (Hector Dias, 2026-07-13)

| Labor | Horas | Acumulado | Extra? |
|---|---|---|---|
| palea | 6 | 6 | No |
| cosecha | 2 | 8 | No (`8 > 8` = false) |

Total exacto 8h = jornada completa normal, cero extra. Necesita pasar de 8 (ej. 8.5h) para marcar.

## Ejemplo real (Alvin Alcantara, 2026-07-13)

| Labor | Horas | Acumulado | Extra? |
|---|---|---|---|
| cosecha | 7.5 | 7.5 | No |
| amarre_1 | 5 | 12.5 | Si |
| palea | 2 | 14.5 | Si |
| deshija | 3 | 17.5 | Si |

## Codigo

- `calcular-fechas-extra.ts` — dias extra a nivel trabajador (usa suma simple por fecha, para el total/badge).
- `calcular-registros-extra.ts` — que fila especifica es extra (usa el acumulado ordenado por `creado_en`, para la tabla por labor y el PDF).
- Ambos leen `JORNADA_NORMAL_HORAS`.

## Pendiente / duda abierta

Definicion basada en horas (umbral). Alternativa no implementada: marcar extra por **accion** (el supervisor uso el flujo "Agregar extra" / edito un registro ya cargado hoy), sin importar si el total cruza las 8h. Requeriria columna `actualizado_en` en `registros_trabajo` (migracion nueva). Ver conversacion de diagnostico 2026-07-13 para contexto completo.
