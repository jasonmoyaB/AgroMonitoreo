---
name: planilla-trabajadores
description: Use when building or extending worker payroll ("planilla de sueldos") for AgroMonitoreo — admin-entered weekly salary per worker, per-worker/per-finca and cross-finca payroll views, payslips ("liquidación"). Activates whenever the user mentions salario, sueldo, pago semanal, planilla, nómina, liquidación de pago, or is working on the Planilla branch/feature — even if they don't use those exact words but describe paying workers a weekly amount. Encodes the confirmed business rule that el admin de oficina ingresa manualmente un salario semanal fijo por trabajador (en USD o colones) — NOT computed from hours or production — and gives the phased data model, RLS pattern, and reuse points (week-range util, PDF generator) needed to build it correctly on top of the existing trabajadores, registros_trabajo, and asistencia tables.
---

# Planilla de Trabajadores — Guía de Dominio y Fases

Actuás como el administrador de empresa a cargo de llevar la planilla de Birrisito (y del resto de fincas que se agreguen). Tu trabajo no es solo escribir código: es tomar las mismas decisiones que tomaría un gerente de RRHH — qué se paga, qué se pregunta antes de asumir, y qué se deja para después para no romper nada.

## La regla de negocio que lo define todo (confirmada por el usuario)

**El admin de oficina ingresa manualmente un salario semanal fijo por trabajador — no se calcula desde horas ni desde producción.**

Ejemplo real dado por el usuario: "trabajador Jason: 80.000 colones a la semana, y así con todos". Cada trabajador tiene su propio monto semanal, elegido por el admin, en una de dos monedas: **USD o colones** (confirmado explícitamente — no son pesos chilenos/CLP, aunque `CLAUDE.md` describa la finca Birrisito como una operación en Chile; tomá esa discrepancia como dato real del negocio, no como error a corregir).

- `registros_trabajo.horas` y `registros_trabajo.cantidad` (cajas, tramos, etc.) siguen existiendo y son **solo datos de productividad/asistencia** — se pueden mostrar junto a la planilla para dar contexto ("trabajó 38 horas, faltó 1 día"), pero **ninguno de los dos determina el monto a pagar**. Si escribís una fórmula que multiplica horas o cantidad por una tarifa para llegar al sueldo, estás construyendo el modelo equivocado — pará y releé esta sección.
- El monto y la moneda son **por trabajador**, editables en cualquier momento por el admin (mismo lugar que el CRUD de trabajadores) — no hardcodees valores de ejemplo (los 80.000 de Jason) en migraciones ni en código.

## Preguntas de negocio que hay que confirmar antes de construir cada fase

No asumas estas respuestas — pausá y preguntá si la conversación no las trae ya resueltas:

- ¿El salario semanal es un valor recurrente (se mantiene igual semana tras semana hasta que el admin lo cambie), o se espera que varíe semana a semana para el mismo trabajador?
- Si un trabajador falta toda la semana (`asistencia` marca ausencia todos los días), ¿se le paga igual el monto fijo, o se prorratea/descuenta? Como el pago ya no depende de horas, esto es una decisión de negocio real, no un detalle de cálculo.
- ¿Hace falta un estado "pagado / pendiente de pago" separado de "cerrado", o cerrar la semana ya implica que se pagó?
- ¿Se necesitan adelantos, bonos manuales o descuentos (ej. por herramienta, préstamo) sobre el monto fijo?

## Reusar, no reinventar

Antes de escribir cualquier util nuevo para esto, mirá lo que ya existe en `features/asistencia` — ya resuelve dos problemas que la planilla necesita:

- **Rango de semana (lunes–domingo):** `features/asistencia/utils/obtener-rango-semana.ts` ya define la convención de semana de pago que usa la tabla de asistencia semanal. Usá la misma función y el mismo corte lunes–domingo para la planilla — no inventes un segundo criterio de "semana" en el mismo dominio.
- **Generación de PDF:** `features/asistencia/utils/generar-pdf-ausencias.ts` genera el PDF de ausencias armando un stream directo con `shared/lib/pdf-doc.ts` (`textoPdf` + `crearBlobPdf`), sin ninguna librería como jsPDF. La liquidación de sueldo (payslip) debe seguir el mismo patrón — no agregues una dependencia de PDF nueva para esto.
- **Fechas:** `features/captura/utils/fecha-iso.ts` y `obtener-dias-en-mes.ts` para cualquier math de fechas, como ya hace `asistencia` y `supervisor`.

## Fase 1 — lo primordial (esto es el MVP, constrúyelo primero)

1. **Salario semanal + moneda, editables por trabajador.** Ya implementado: `supabase/migrations/20260720173819_agregar_salario_semanal_a_trabajadores.sql` agrega `salario_semanal numeric(10,2) not null default 0` y `moneda text not null default 'colones' check (moneda in ('usd', 'colones'))` a `trabajadores`. Editable desde la misma pantalla de CRUD de trabajadores (`TrabajadoresCrudScreen`) — es un dato del trabajador, no una tabla aparte.
2. **Vista semanal en vivo (sin cálculo, solo lectura).** Para la semana actual/seleccionada: listar los trabajadores de la finca con su `salario_semanal` y `moneda` actuales, junto a sus `horas`/ausencias de esa semana como contexto informativo. No hay ninguna multiplicación ni agregación que produzca el monto — el monto ya está en `trabajadores.salario_semanal`.
3. **`pagos_semanales` — la foto congelada cuando se cierra/paga la semana.** Solo se inserta una fila cuando el admin/supervisor confirma el pago de esa semana para ese trabajador:
   - `finca_id`, `trabajador_id`, `semana_inicio`, `semana_fin` (mismo par que devuelve `obtenerRangoSemana`)
   - `monto numeric(10,2)` y `moneda text` — **snapshot de `trabajadores.salario_semanal`/`moneda` en el momento del pago**, no un join en vivo. Si el admin cambia el salario de un trabajador más adelante, las semanas ya pagadas no deben moverse.
   - `registrado_por` default `usuario_actual_id()`, `creado_en timestamptz default now()`
   - `unique (trabajador_id, semana_inicio)` — no se puede pagar la misma semana dos veces
   - **Sin política de `update` ni `delete`.** Una semana pagada es un registro financiero: una corrección se hace con un ajuste nuevo, no editando el pasado (mismo principio que ya aplica en este proyecto a otros datos que no se tocan retroactivamente).
4. **RLS + grants — seguí el patrón ya establecido, no lo reinventes:**
   - Policies vía join a `usuario` (`usuario.auth_user_id = auth.uid() and usuario.finca_id = pagos_semanales.finca_id and usuario.activo = true`), igual que `registros_trabajo` y `asistencia`.
   - `grant select, insert on table public.pagos_semanales to authenticated;` explícito en la misma migración — el gotcha ya documentado en `CLAUDE.md` es que el grant remoto no se replica solo en local ni en un proyecto nuevo.
   - Para que admin/oficina vea todas las fincas, replicar el patrón de `20260714165119_permitir_lectura_multi_finca_admin_oficina.sql`, no una policy nueva desde cero.
5. **Pantallas — misma arquitectura headless que `asistencia`/`trabajadores`:** feature `features/planilla` (services/hooks/utils/types/constants, sin screens propias) alojada en `features/supervisor/screens/PlanillaScreen.tsx` (tabla semanal: trabajador, salario semanal, moneda, horas/ausencias de contexto, botón "pagar semana") y en el lado admin como una screen "por finca" (mismo patrón que `TrabajadoresPorFincaScreen`/`AsistenciaPorFincaScreen`) para ver todas las fincas.
6. **Liquidación en PDF** por trabajador/semana: nombre, rango de semana, monto, moneda — generado con el mismo generador de stream que `generarPdfAusencias.ts`.

## Fase 2 — después de que la Fase 1 funcione y se use un tiempo

No lo construyas todavía, pero dejá el modelo de datos de la Fase 1 sin obstáculos para esto:

- Rollup de planilla consolidado por finca y entre fincas (total pagado por semana/mes) en el dashboard de admin.
- Ajustes manuales sobre el bruto: bonos, descuentos, adelantos — probablemente una tabla `ajustes_planilla` referenciando la fila de `planillas_semanales`, no una columna mutable sobre el snapshot.
- Exportar consolidado de todas las fincas (CSV o PDF).

## Fase 3 — descuentos legales (NO construir sin pedido explícito)

Cosas como gratificación legal, horas extra con recargo, cotizaciones de pensión/salud, seguro de cesantía, impuesto sobre la renta, etc. son una capa de cumplimiento legal real con tasas que cambian por ley **y dependen del país** — y dado que la moneda confirmada es USD/colones (no CLP), no asumas que el marco legal es el de Chile solo porque `CLAUDE.md` describe la finca como una operación chilena. Construir esto sin que el usuario confirme país, ítems y tasas exactas puede terminar en una liquidación de sueldo incorrecta para un trabajador real. Preguntá antes de tocar esto, no lo infieras de "lo primordial".

## Checklist antes de entregar cualquier parte de esta feature

- [ ] ¿El monto a pagar sale de `trabajadores.salario_semanal`, nunca de una fórmula con `horas` o `cantidad`?
- [ ] ¿El salario y la moneda son campos editables por trabajador, no un número fijo en código?
- [ ] ¿Reutilizaste `obtenerRangoSemana` en vez de definir otro criterio de semana?
- [ ] ¿Reutilizaste `shared/lib/pdf-doc.ts` en vez de agregar una librería de PDF?
- [ ] ¿Las semanas pagadas en `pagos_semanales` son insert-only (sin update/delete)?
- [ ] ¿La migración nueva incluye su propio `grant ... to authenticated`?
- [ ] ¿Sigue el layering del proyecto (`components → hooks → services → utils`, headless feature alojada en una screen de `supervisor`/`admin`)?
