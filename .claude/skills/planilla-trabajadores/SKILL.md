---
name: planilla-trabajadores
description: Use when building or extending worker payroll ("planilla de sueldos") for AgroMonitoreo — admin-entered monthly salary per worker, paid out in fortnightly ("quincena") installments, per-worker/per-finca and cross-finca payroll views, payslips ("liquidación"). Activates whenever the user mentions salario, sueldo, quincena, planilla, nómina, liquidación de pago, or is working on the Planilla branch/feature — even if they don't use those exact words but describe paying workers a monthly or biweekly amount. Encodes the confirmed business rule that el admin de oficina ingresa manualmente un salario mensual fijo por trabajador (en USD o colones), y cada quincena se paga la mitad — NOT computed from hours or production — and gives the phased data model, RLS pattern, and reuse points (PDF generator) needed to build it correctly on top of the existing trabajadores, registros_trabajo, and asistencia tables.
---

# Planilla de Trabajadores — Guía de Dominio y Fases

Actuás como el administrador de empresa a cargo de llevar la planilla de Birrisito (y del resto de fincas que se agreguen). Tu trabajo no es solo escribir código: es tomar las mismas decisiones que tomaría un gerente de RRHH — qué se paga, qué se pregunta antes de asumir, y qué se deja para después para no romper nada.

## La regla de negocio que lo define todo (confirmada por el usuario)

**El admin de oficina ingresa manualmente un salario MENSUAL fijo por trabajador. Se paga en dos quincenas iguales (mitad cada una) — no se calcula desde horas ni desde producción.**

Ejemplo real dado por el usuario: "trabajador Jason: 400.000 al mes, es decir 200.000 a la quincena". El monto de la quincena = `salario_mensual / 2` — no es un dato independiente, es derivado.

- Moneda: **USD o colones** (confirmado explícitamente — no son pesos chilenos/CLP, aunque `CLAUDE.md` describa la finca Birrisito como una operación en Chile; tomá esa discrepancia como dato real del negocio, no como error a corregir).
- `registros_trabajo.horas` y `registros_trabajo.cantidad` (cajas, tramos, etc.) siguen existiendo y son **solo datos de productividad/asistencia** — se pueden mostrar junto a la planilla para dar contexto, pero **ninguno de los dos determina el monto a pagar**. Si escribís una fórmula que multiplica horas o cantidad por una tarifa para llegar al sueldo, es el modelo equivocado — pará y releé esta sección.
- El monto mensual y la moneda son **por trabajador**, editables en cualquier momento por el admin (mismo lugar que el CRUD de trabajadores) — no hardcodees valores de ejemplo (los 400.000 de Jason) en migraciones ni en código.

## Preguntas de negocio que hay que confirmar antes de construir cada fase

No asumas estas respuestas — pausá y preguntá si la conversación no las trae ya resueltas:

- ¿La quincena es siempre exactamente la mitad del mensual, o puede haber ajustes por quincena (ej. una quincena con más días)?
- Si un trabajador falta toda la quincena, ¿se le paga igual el monto fijo, o se prorratea/descuenta?
- ¿Hace falta un estado "pagado / pendiente de pago", o insertar el registro de la quincena ya implica que se pagó?
- ¿Se necesitan adelantos, bonos manuales o descuentos sobre el monto de la quincena?
- ¿Cómo se definen los cortes de quincena (1–15 / 16–fin de mes, o semanas fijas)? No asumas — no existe todavía ningún util de fechas para esto en el proyecto (a diferencia de la semana lunes–domingo de `asistencia`, que es para otro propósito y no aplica acá).

## Reusar, no reinventar

- **Generación de PDF:** `features/asistencia/utils/generar-pdf-ausencias.ts` genera PDF armando un stream directo con `shared/lib/pdf-doc.ts` (`textoPdf` + `crearBlobPdf`), sin ninguna librería como jsPDF. La liquidación de sueldo (payslip) debe seguir el mismo patrón — no agregues una dependencia de PDF nueva.
- **Fechas:** `features/captura/utils/fecha-iso.ts` y `obtener-dias-en-mes.ts` para cualquier math de fechas. `obtener-rango-semana.ts` de `asistencia` es para la semana de asistencia (lunes–domingo) — NO es el corte de quincena, no lo reutilices para esto sin confirmar que coincide.

## Fase 1 — lo primordial (esto es el MVP, constrúyelo primero)

1. **Salario mensual + moneda, editables por trabajador.** Ya implementado: `supabase/migrations/20260727154626_agregar_salario_mensual_a_trabajadores.sql` agrega `salario_mensual numeric(10,2) not null default 0` y `moneda text not null default 'colones' check (moneda in ('usd', 'colones'))` a `trabajadores`. Editable desde `TrabajadoresCrudScreen` — es un dato del trabajador, no una tabla aparte.
2. **Vista de quincena en vivo (sin cálculo complejo, solo lectura + división por 2).** Para la quincena actual/seleccionada: listar los trabajadores de la finca con `salario_mensual / 2` como monto a pagar, junto a `moneda`, y horas/ausencias de esa quincena como contexto informativo.
3. **`pagos_quincenales` — la foto congelada cuando se paga la quincena.** Solo se inserta una fila cuando el admin confirma el pago de esa quincena para ese trabajador:
   - `finca_id`, `trabajador_id`, `quincena_inicio`, `quincena_fin` (definir el corte primero — ver pregunta de negocio arriba)
   - `monto numeric(10,2)` y `moneda text` — **snapshot de `trabajadores.salario_mensual / 2` y `moneda` en el momento del pago**, no un join en vivo. Si el admin cambia el salario de un trabajador más adelante, las quincenas ya pagadas no deben moverse.
   - `registrado_por` default `usuario_actual_id()`, `creado_en timestamptz default now()`
   - `unique (trabajador_id, quincena_inicio)` — no se puede pagar la misma quincena dos veces
   - **Sin política de `update` ni `delete`.** Una quincena pagada es un registro financiero: una corrección se hace con un ajuste nuevo, no editando el pasado.
4. **RLS + grants — seguí el patrón ya establecido, no lo reinventes:**
   - Policies vía join a `usuario` (`usuario.auth_user_id = auth.uid() and usuario.finca_id = pagos_quincenales.finca_id and usuario.activo = true`), igual que `registros_trabajo` y `asistencia`.
   - `grant select, insert on table public.pagos_quincenales to authenticated;` explícito en la misma migración — el gotcha ya documentado en `CLAUDE.md` es que el grant remoto no se replica solo en local ni en un proyecto nuevo.
   - Para que admin/oficina vea todas las fincas, replicar el patrón de `20260714165119_permitir_lectura_multi_finca_admin_oficina.sql`, no una policy nueva desde cero.
5. **Pantallas — misma arquitectura headless que `asistencia`/`trabajadores`:** feature `features/planilla` (services/hooks/utils/types/constants, sin screens propias) alojada en `features/supervisor/screens/PlanillaScreen.tsx` (tabla de quincena: trabajador, salario mensual, monto de quincena, moneda, botón "pagar quincena") y en el lado admin como screen "por finca" (mismo patrón que `TrabajadoresPorFincaScreen`/`AsistenciaPorFincaScreen`).
6. **Liquidación en PDF** por trabajador/quincena: nombre, rango de quincena, monto, moneda — generado con el mismo generador de stream que `generarPdfAusencias.ts`.

## Fase 2 — después de que la Fase 1 funcione y se use un tiempo

No lo construyas todavía, pero dejá el modelo de datos de la Fase 1 sin obstáculos para esto:

- Rollup de planilla consolidado por finca y entre fincas (total pagado por quincena/mes) en el dashboard de admin.
- Ajustes manuales sobre el monto: bonos, descuentos, adelantos — probablemente una tabla `ajustes_planilla` referenciando la fila de `pagos_quincenales`, no una columna mutable sobre el snapshot.
- Exportar consolidado de todas las fincas (CSV o PDF).

## Fase 3 — descuentos legales (NO construir sin pedido explícito)

Gratificación legal, horas extra con recargo, cotizaciones de pensión/salud, seguro de cesantía, impuesto sobre la renta, etc. son una capa de cumplimiento legal real con tasas que cambian por ley **y dependen del país** — y dado que la moneda confirmada es USD/colones (no CLP), no asumas que el marco legal es el de Chile solo porque `CLAUDE.md` describe la finca como una operación chilena. Construir esto sin que el usuario confirme país, ítems y tasas exactas puede terminar en una liquidación de sueldo incorrecta para un trabajador real. Preguntá antes de tocar esto.

## Checklist antes de entregar cualquier parte de esta feature

- [ ] ¿El monto a pagar sale de `trabajadores.salario_mensual / 2`, nunca de una fórmula con `horas` o `cantidad`?
- [ ] ¿El salario mensual y la moneda son campos editables por trabajador, no un número fijo en código?
- [ ] ¿El corte de quincena está confirmado con el usuario, no asumido?
- [ ] ¿Reutilizaste `shared/lib/pdf-doc.ts` en vez de agregar una librería de PDF?
- [ ] ¿Las quincenas pagadas en `pagos_quincenales` son insert-only (sin update/delete)?
- [ ] ¿La migración nueva incluye su propio `grant ... to authenticated`?
- [ ] ¿Los timestamps de migración van DESPUÉS del último ya commiteado? (`git log --oneline -1 -- supabase/migrations/` para chequear el más reciente antes de nombrar una nueva)
- [ ] ¿Sigue el layering del proyecto (`components → hooks → services → utils`, headless feature alojada en una screen de `supervisor`/`admin`)?
