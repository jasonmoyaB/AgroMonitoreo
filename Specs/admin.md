# Spec — admin

El shell de oficina. Lee lo que cargó el campo y administra lo que el campo no toca. Cruza **todas** las fincas.

## Rutas (bajo `RouteGuard soloAdmin`)

| Ruta | Qué |
|---|---|
| `/admin` | Dashboard rollup, todas las fincas |
| `/admin/dashboard-finca` | Dashboard de una finca |
| `/admin/fincas` | CRUD de fincas |
| `/admin/supervisores` | Invitar, asignar finca, promover a admin |
| `/admin/trabajadores` | Trabajadores por finca + `asegurado` |
| `/admin/planilla` | Quincena, salarios, valor hora, pago |
| `/admin/asistencia` | Ausencias por finca |
| `/admin/traslados` | Resolver traslados |
| `/admin/configuracion` | Perfil propio |

## Reglas

- **El admin no depende de finca propia.** Elige la finca a mano en cada pantalla (`FincaSelector`), y por eso `decidir-acceso-ruta.ts` nunca lo manda a `sin-finca`.
- **Invitar es la única alta de usuarios.** Va por la edge function `invitar-usuario`, que existe solo porque necesita el `service_role` — que no puede vivir en el front. La función valida el JWT del llamador **y** que su fila de `usuario` sea `admin_oficina` activo: `verify_jwt` sola no alcanza, un supervisor también tiene JWT válido.
- El invitado nace `supervisor` **sin finca**. Asignársela es un segundo paso explícito en `/admin/supervisores`. Ni el rol ni la finca se leen de metadata del cliente.
- `APP_URL` es secret obligatorio de la función: sin él el link cae al Site URL y el invitado entra con sesión activa **sin haber definido contraseña**.
- Los inputs numéricos (valor hora, salario) pasan por `leer-numero-no-negativo.ts`, que devuelve `null` para vacío, texto, negativo o `Infinity` — el llamador restaura el valor previo en vez de mandar `NaN` a la base.
- Los dashboards agrupan **por unidad de medida**, igual que el del supervisor.

## Qué NO hace

- **No escribe registros de trabajo ni ausencias del día a día.** Eso lo carga el campo.
- No borra fincas ni trabajadores: baja lógica.
- No edita una quincena ya pagada.
- No cambia contraseñas ajenas.
