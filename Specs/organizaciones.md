# Spec — organizaciones

Varias empresas usan la misma app y **ninguna puede ver nada de otra**. La organización es el
aislamiento externo; `finca_id` sigue siendo el grano de las tablas de datos, adentro de ella.

No es una feature de `src/features/`: no tiene pantallas propias. Vive en el esquema, en las
policies y en un runbook. Esta spec existe porque es el contrato que **todas** las demás
features tienen que respetar.

## Modelo

```
organizaciones (id, nombre, slug, activa)
    │
    ├── fincas.organizacion_id          -> not null, default private.organizacion_del_usuario()
    │       └── trabajadores, registros_trabajo, asistencia,
    │           datos_trabajadores, pagos_quincenales, traslados   (todas por finca_id)
    │               └── salarios_trabajadores                      (por trabajador_id)
    │
    └── usuario.organizacion_id         -> nullable, es el ancla de la RLS
```

## Reglas

- **`organizacion_id` vive solo en `fincas`.** El resto deriva por `finca_id`. No se
  denormaliza en cada tabla: haría falta una FK compuesta `(finca_id, organizacion_id)` por
  tabla, y una FK compuesta es un segundo camino de embed → `PGRST201`.
- **`usuario` es la excepción** y lleva la suya. Un `admin_oficina` administra las N fincas de
  su organización y su `finca_id` puede ser null; un invitado nace sin finca. No hay finca de
  la cual derivar el alcance.
- **La finca asignada a un usuario pertenece a su organización.** Lo impone un trigger, no una
  FK compuesta, por la misma razón de arriba.
- **Un usuario pertenece a una sola organización, para siempre.** Un trigger rechaza mover a
  alguien de empresa, incluso siendo admin. `null -> valor` sí se permite: es el alta.
- **Ninguna rama de un `using` queda sin acotar.** Toda rama de admin lleva además
  `finca_id in (select * from private.fincas_de_mi_organizacion())`.
- **Los traslados no cruzan organizaciones.** Origen y destino tienen que estar los dos en la
  organización, en select, en insert y en la resolución.
- **`fincas.id` lo genera la base**: `<slug org>-<slug nombre>`, con sufijo numérico si choca.
  El admin escribe solo el nombre.
- **Las fotos van por URL firmada.** El bucket es privado y su policy de lectura está acotada
  por organización. `trabajadores.foto_url` guarda la **ruta**, no una URL: una firma vence.
- **El cache persistido se limpia al iniciar sesión**, no solo al cerrarla. Un blob de
  IndexedDB sobrevive a un token vencido y la RLS no lo alcanza.

## Helpers de RLS (schema `private`, nunca `public`)

| Helper | Devuelve | Para qué |
|---|---|---|
| `private.organizacion_del_usuario()` | `uuid` o null | Acotar `fincas`, `usuario`, `organizaciones` |
| `private.fincas_de_mi_organizacion()` | `setof text` | Acotar todo lo que tiene `finca_id` |
| `private.finca_del_usuario()` | `text` o null | La finca del supervisor (ya existía) |
| `private.es_admin_oficina()` | `boolean` | El rol (ya existía; **no** acota nada por sí solo) |

Los tres primeros devuelven null o conjunto vacío para un usuario sin organización, así que el
default es no ver nada.

## Alta de un cliente

`docs/instruccions/10-alta-de-organizacion.md`. Es SQL, no pantalla, y no existe rol
`super_admin`: un rol que ve todas las organizaciones sería la única cuenta capaz de mezclar
clientes.

Dos cosas del procedimiento que no son obvias y ya mordieron:

- **Promover al primer admin exige un claim.** El `update` sobre `usuario` lo rechaza
  `evitar_escalada_privilegios_usuario` si no hay JWT (`auth.uid()` null →
  `es_admin_oficina()` false). Va con
  `set local request.jwt.claims = '{"sub":"<auth_user_id de un admin activo>"}'`, no apagando
  el trigger. Detalle en `errores-conocidos.md`.
- **El invitado del Dashboard no define contraseña.** Esa invitación no permite fijar
  `redirectTo`, así que el link cae al `Site URL` y la persona entra con sesión activa y sin
  contraseña propia. Tiene que pasar por `/olvide-password`. La invitación desde la app no
  tiene el problema: `invitar-usuario` manda el `redirectTo` correcto.

## Verificación

`supabase/tests/aislamiento.sql`, contra el stack local después de `supabase db reset`.
Comprueba cero filas ajenas, al menos una fila propia (una policy ciega no es una policy
aislada) y que las escrituras cruzadas se rechazan. `supabase/seed.sql` siembra dos
organizaciones para que una mezcla se vea en `pnpm dev` el mismo día.

## Qué NO hace

- **No hay pantalla `/admin/organizacion`.** El admin solo ve el nombre de su empresa en el
  sidebar; renombrarla es SQL.
- **No hay subdominio por cliente.** Todos entran por el mismo dominio y la organización sale
  del usuario logueado, nunca del hostname — sería un segundo camino de aislamiento del lado
  del cliente, compitiendo con el del JWT.
- **No hay usuarios en dos organizaciones.** Sin "organización activa" en sesión. Un consultor
  con dos clientes usa dos correos.
- **Las labores NO son por organización.** Siguen hardcodeadas en
  `shared/constants/tipos-labor.constants.ts` y son de banano. Un cliente de otro cultivo
  todavía no puede usar la app — es el bloqueante comercial número uno, y es otra rama.
