# Glosario

Términos del dominio, tal como aparecen en el código.

## Organización

| Término | Qué es | Dónde |
|---|---|---|
| **Finca** | Unidad de aislamiento de todo el sistema. La única real hoy es `birrisito`. Tiene `valor_hora` y `valor_hora_usd`, que fijan el costo del día ausente. | tabla `fincas`, `Finca` en `domain.types.ts` |
| **Capataz / supervisor** | Quien carga los datos en campo. Rol `supervisor`. Toda alta crea uno, y **sin finca**: la asigna el admin después. | rol `supervisor`, `features/supervisor` |
| **Admin de oficina** | Lee lo que cargó el campo y gestiona fincas, supervisores, salarios y planilla. Cruza todas las fincas. Se promueve por SQL. | rol `admin_oficina`, `features/admin` |
| **Usuario** | Fila 1:1 con `auth.users` vía `auth_user_id`; guarda `rol_id`, `finca_id`, `nombre`. Es por donde todas las policies RLS hacen join. `finca_id` es nullable: null = invitado a la espera de que el admin le asigne finca. | tabla `usuario` |

El flujo es de un solo sentido: supervisor carga → admin lee. No hay flujo inverso.

## Trabajo diario

| Término | Qué es | Dónde |
|---|---|---|
| **Trabajador** | Persona de la finca. Tiene foto (bucket `trabajador-fotos`) y baja lógica (`activo`). | tabla `trabajadores` |
| **Datos personales** | Cédula, fecha de ingreso y teléfono del trabajador. Viven en `datos_trabajadores`, tabla propia, **no** en columnas de `trabajadores`: es PII y la policy de `trabajadores` alcanza otras fincas. | tabla `datos_trabajadores` (`20260814173849`) |
| **Asegurado** | Si el trabajador está inscrito ante la CCSS. Lo marca la oficina desde `/admin/trabajadores`; el supervisor ya no lo edita. Default `false`. | `trabajadores.asegurado`, `decisiones.md` 3b |
| **Labor** | Una de las 11 tareas agrícolas: `cosecha`, `amarre_1`–`amarre_4`, `deshija`, `deshoja`, `despunte`, `palea`, `deshierba`, `emplasticado`. Cada una lleva icono, color y unidad (`cajas`, `tramos`, …) que manejan el stepper de cantidad. | `shared/constants/tipos-labor.constants.ts` (duplica la tabla `labores`) |
| **Unidad de medida** | Con qué se cuenta la cantidad de una labor: `cosecha` va en **cajas**, las otras diez en **tramos**. No es cosmética — los dashboards agrupan por ella y **nunca suman entre unidades**. | `TipoLabor.unidadMedida`, `shared/utils/kpis/construir-dashboard-por-unidad.ts` |
| **Registro de trabajo** | La unidad que carga el capataz: trabajador + labor + fecha + horas + cantidad. | tabla `registros_trabajo` |
| **Captura** | El flujo del capataz: elegir labor → elegir trabajador → horas y cantidad con steppers → confirmar. | `features/captura` |
| **Draft** | Captura a medias guardada en IndexedDB con debounce de 300ms. Resiliencia, no fuente de verdad. | `captura/hooks/use-registro-draft.ts` |
| **Productividad** | `cantidad / horas`. El motivo original de la app. Se calcula por unidad, nunca sobre un total mezclado. | `shared/utils/kpis/` |
| **Bloque por unidad** | Lo que pinta un dashboard para *una* unidad: producción diaria del mes, mejor labor y mejor trabajador, todos rotulados con esa unidad. Un mes con cosecha y amarre saca dos bloques. En el PDF, una página por bloque. | `DashboardUnidad` en `kpis.types.ts`, `shared/components/DashboardPorUnidad.tsx` |
| **Hora extra** | Acumulado del día del trabajador, sumando todas sus labores, estrictamente mayor a 8h. | `docs/horas-extra.md`, `JORNADA_NORMAL_HORAS` |

## Ausencias y movimientos

| Término | Qué es | Dónde |
|---|---|---|
| **Asistencia / ausencia** | Marca de ausencia del día. Tipos: `vacaciones`, `permisos`, `permisos_medicos`. | tabla `asistencia`, `features/asistencia` |
| **Traslado** | Préstamo de un trabajador a otra finca **por un día**. Estados `pendiente` / `aprobado` / `rechazado`. No se devuelve a mano: vence por fecha. | tabla `traslados_trabajadores`, `features/traslados` |
| **Prestado / trasladado** | Las dos caras del mismo traslado: *prestado* es el lado destino (badge "De {finca}"), *trasladado* es el lado origen (bloquea seleccionarlo ese día). | `traslados-service.ts` |

## Pagos

| Término | Qué es | Dónde |
|---|---|---|
| **Salario mensual** | Monto fijo que el admin escribe a mano por trabajador, en `usd` o `colones`. No se calcula desde horas ni producción. Se edita en la propia fila de la planilla, no en una pantalla aparte. | tabla `salarios_trabajadores`, `admin/components/CeldasSalario.tsx` en `/admin/planilla` |
| **Quincena** | Medio mes calendario: 1–15 y 16–fin de mes. 24 por año. | `planilla/utils/obtener-rango-quincena.ts` |
| **Monto de quincena** | Bruto: `salario_mensual / 2`, redondeado según moneda (colones al entero, USD a 2 decimales). Neto: bruto menos las ausencias de esa quincena, topado en 0. | `shared/utils/calcular-monto-quincena.ts`, `planilla/utils/construir-filas-planilla.ts` |
| **Monto semanal** | Columna **informativa** de la planilla: mensual / 4. No se paga ni se registra, solo se muestra. | `shared/utils/calcular-monto-semanal.ts` |
| **Planilla** | La vista de la quincena: todos los trabajadores de una finca con su monto y si ya se pagó. | `features/planilla`, `/admin/planilla` |
| **Pago quincenal** | El registro financiero del pago. `monto` y `moneda` son un snapshot congelado: subir un salario después no reescribe lo ya pagado. | tabla `pagos_quincenales` |
| **Liquidación** | El PDF por trabajador de esa quincena. | `planilla/utils/generar-pdf-liquidacion.ts` |
| **Valor hora** | Dos campos de `fincas`, editables arriba de la tabla en `/admin/planilla` (`ValorHoraFinca.tsx`): `valor_hora` (colones) y `valor_hora_usd`. Se usa el que coincide con la moneda del salario. `0` = sin definir, no descuenta. | `fincas.valor_hora`, `fincas.valor_hora_usd` |
| **Día ausente** | Lo que cuesta una falta: `valor_hora × 8`. Con 1750 son 14 000. | `planilla/utils/calcular-deduccion-ausencias.ts` |

## Siglas

- **RLS** — Row Level Security de Postgres. Acá todas las policies hacen join a través de `usuario`.
- **PWA** — Progressive Web App. La app se instala y tiene service worker (`vite-plugin-pwa`).
- **KPI** — los indicadores de los dashboards (horas, cantidad, productividad, rankings, tendencia). Los que dependen de la cantidad producida van siempre por unidad.
- **MCP `codebase-memory`** — el servidor con el que se navega este repo. Es la primera opción para buscar código, antes que Grep/Glob.
- **`neu-*`** — los tokens neumórficos de `src/index.css` (`neu-raised`, `neu-pressed`, `neu-well`).
