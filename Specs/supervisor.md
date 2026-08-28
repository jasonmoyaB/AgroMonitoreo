# Spec — supervisor

El shell del capataz. Aporta sidebar, rutas y KPIs propios, y **hospeda** las features headless (`trabajadores`, `asistencia`, `traslados`, `perfil`).

## Rutas (bajo `RouteGuard`)

| Ruta | Qué |
|---|---|
| `/supervisor` | Lista de labores → entrada a captura |
| `/supervisor/dashboard` | KPIs del mes |
| `/supervisor/trabajadores` (+ `/nuevo`) | CRUD de su finca |
| `/supervisor/asistencia` | Ausencias |
| `/supervisor/traslados` | Solicitar / ver préstamos |
| `/supervisor/configuracion` | Perfil propio |

## Reglas

- **Solo su finca.** Todo el scoping lo hace la RLS por `private.finca_del_usuario()`; el front no filtra por su cuenta.
- **Sin finca asignada no entra**: `RouteGuard` muestra `SinFincaAsignada`.
- Los KPIs leen `captura/hooks/use-registros-del-mes.ts`. Es cross-feature permitido: el dato nace en captura.
- **Producción y rankings van por unidad de medida**, un bloque por unidad (`shared/components/DashboardPorUnidad.tsx`). Cajas y tramos no se suman ni se rotulan "unidades".
- El flujo es de un solo sentido: el supervisor carga, el admin lee. **No hay flujo inverso** — nada que la oficina escriba vuelve a esta pantalla como tarea.

## Qué NO hace

- No ve otras fincas (salvo el nombre de trabajadores activos, por la rama sin scoping de `trabajadores_select_activos_finca_o_admin`).
- No ve ni edita salarios, pagos ni valor hora.
- No marca `asegurado`.
- No invita usuarios.
