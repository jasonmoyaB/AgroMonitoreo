# Dar de alta una organización (cliente nuevo)

Cuando le vendés la app a una empresa nueva. Son tres pasos y no hay pantalla: el alta de un
cliente es un evento raro y con contrato de por medio, y crear un rol capaz de hacerlo desde
la UI significaría crear la única cuenta capaz de cruzar clientes (`decisiones.md` 1f).

Todo corre contra **producción**, desde el SQL Editor del Dashboard de Supabase.

---

## 1. Crear la organización

```sql
insert into public.organizaciones (nombre, slug)
values ('Chayotes Alturas', 'chayotes')
returning id;
```

- `nombre` es lo que ve el admin en su sidebar. Se puede cambiar después sin consecuencias.
- `slug` **no**: es el prefijo de los ids de todas las fincas que cree ese cliente
  (`chayotes-la-esperanza`). Cambiarlo después no renombra las fincas ya creadas, así que
  quedarían dos convenciones conviviendo. Elegilo bien la primera vez.
  Formato obligatorio: `^[a-z0-9-]+$`.

## 2. Invitar a su primer admin

Esto **no** se puede hacer desde `/admin/supervisores`: esa pantalla invita dentro de *tu*
organización, y acá el invitado tiene que nacer en la del cliente.

Invitá desde el Dashboard (**Authentication → Users → Invite user**) y después asigná rol y
organización a mano:

```sql
update public.usuario
   set nombre = 'Nombre del dueño',
       organizacion_id = (select id from public.organizaciones where slug = 'chayotes'),
       rol_id = (select id from public.roles where nombre = 'admin_oficina')
 where email = 'admin@clientenuevo.com';
```

El `admin_oficina` queda **sin finca** a propósito: administra todas las fincas de su
organización y elige cuál mirar en cada pantalla. Su alcance sale de `organizacion_id`.

> Si el update tira `No se puede mover un usuario de organizacion`, esa fila ya tenía una
> organización asignada. Es el trigger `evitar_escalada_privilegios_usuario` haciendo su
> trabajo: un usuario no cambia de empresa. Invitá con otro correo.

## 3. Listo

De acá en adelante el cliente se administra solo:

- Crea sus fincas desde `/admin/fincas` — solo escribe el nombre, el id lo arma la base con
  el prefijo de su organización.
- Invita a sus supervisores desde `/admin/supervisores`. La edge function `invitar-usuario`
  lee la organización del admin que invita y se la estampa al invitado; nunca sale del
  cuerpo del request (`decisiones.md` 9f).
- Le asigna una finca a cada supervisor desde esa misma tabla.

---

## Verificar que quedó aislado

Antes de entregarle las credenciales, comprobá que no ve nada tuyo ni vos nada suyo:

```sql
-- Cuántas filas alcanza cada organización. Los dos conjuntos tienen que ser disjuntos.
select o.nombre,
       count(distinct f.id)  as fincas,
       count(distinct t.id)  as trabajadores,
       count(distinct u.id)  as usuarios
from public.organizaciones o
left join public.fincas f       on f.organizacion_id = o.id
left join public.trabajadores t on t.finca_id = f.id
left join public.usuario u      on u.organizacion_id = o.id
group by o.nombre;

-- Ninguna finca puede quedar sin organización (la columna es not null, esto tiene que dar 0).
select count(*) from public.fincas where organizacion_id is null;

-- Un usuario sin organización no lo puede rescatar ningún admin desde la UI: arreglalo acá.
select email, organizacion_id from public.usuario where organizacion_id is null;
```

La prueba de verdad es `supabase/tests/aislamiento.sql`, pero **corre contra el stack local**
(necesita las dos organizaciones sintéticas del seed y hacerse pasar por cada rol). No lo
apuntes a producción.

## Dar de baja un cliente

No hay borrado: `organizaciones.activa = false`. Los datos quedan —una planilla pagada es un
registro contable— pero nadie de esa empresa entra, porque `fincas_select_mi_organizacion`
exige que la finca sea de la organización del usuario y el resto de las policies cuelgan de
ahí. Si además querés cortar el login, desactivá sus usuarios:

```sql
update public.usuario set activo = false
 where organizacion_id = (select id from public.organizaciones where slug = 'chayotes');
```

`activo = false` saca al usuario de todos los helpers de RLS (`private.finca_del_usuario()`,
`private.organizacion_del_usuario()`, `private.es_admin_oficina()` filtran por él), así que
aunque la sesión siga viva no alcanza ninguna fila.
