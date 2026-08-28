-- Capa `organizaciones` arriba de `fincas`: la app deja de ser "un dueno con varias fincas"
-- (decision 1) y pasa a alojar varias empresas que nunca deben verse entre si.
--
-- El eje de aislamiento sigue siendo `finca_id` en las 7 tablas de datos; lo que cambia es
-- que ahora una finca pertenece a una organizacion, y de ahi se deriva todo. La columna
-- NO se denormaliza en cada tabla a proposito: mantenerla sincronizada con `finca_id`
-- exigiria una foreign key compuesta por tabla, que crea un segundo camino de embed y
-- rompe PostgREST con PGRST201 (ya paso en `datos_trabajadores`, ver errores-conocidos.md).
--
-- La excepcion es `usuario`, que si lleva su propia `organizacion_id`: es el ancla de
-- identidad de toda la RLS y no tiene finca de la cual derivarla. Un admin_oficina
-- administra las N fincas de su organizacion (su `finca_id` es irrelevante y puede ser
-- null), y un invitado nace sin finca (20260817164409).
--
-- Todo va en una sola transaccion: no puede existir una ventana donde una finca quede sin
-- organizacion, porque en esa ventana la RLS de la migracion siguiente no la alcanzaria.

begin;

-- ---------------------------------------------------------------------------
-- 1. La tabla
-- ---------------------------------------------------------------------------
-- `slug` existe para construir el id de las fincas nuevas (ver la migracion de triggers):
-- con dos clientes, `fincas.id` deja de poder ser un slug que el admin tipea a mano, porque
-- el segundo que escriba 'la-esperanza' choca con el primero y el error de duplicado le
-- confirma que existe.
create table public.organizaciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(btrim(nombre)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  activa boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table public.organizaciones enable row level security;

-- Solo select: dar de alta una organizacion es un runbook SQL manual
-- (docs/instruccions/10-alta-de-organizacion.md), no una accion de la app. Se aparta
-- del "grant de los cuatro verbos" de flujo-de-trabajo.md a proposito: ese grant existe
-- para que `db reset` no deje la app 403eando en local, y aca no hay ninguna policy de
-- escritura que pudiera funcionar de todos modos.
grant select on table public.organizaciones to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Las columnas
-- ---------------------------------------------------------------------------
-- Nullable las dos por ahora: el backfill de abajo las llena y recien despues se le pone
-- el not null a `fincas`. En `usuario` queda nullable de forma permanente, porque el
-- trigger de alta (crear_usuario_desde_auth) inserta la fila antes de que la edge function
-- `invitar-usuario` pueda estampar la organizacion del admin que invito.
alter table public.fincas
  add column organizacion_id uuid references public.organizaciones(id);

alter table public.usuario
  add column organizacion_id uuid references public.organizaciones(id);

create index fincas_organizacion_idx on public.fincas (organizacion_id);
create index usuario_organizacion_activo_idx on public.usuario (organizacion_id, activo);

-- ---------------------------------------------------------------------------
-- 3. Helper: la organizacion del que consulta
-- ---------------------------------------------------------------------------
-- Mismo patron que private.es_admin_oficina() (20260803232810) y
-- private.finca_del_usuario() (20260818184228): schema `private` para que PostgREST no lo
-- exponga en /rest/v1/rpc/, `security definer` para no volver a disparar la RLS de
-- `usuario` al subconsultarla desde una policy sobre `usuario`, y `search_path = ''` con
-- el cuerpo calificado para que no quede ningun schema escribible en la ruta de
-- resolucion.
--
-- Devuelve null para un usuario sin organizacion, y `<col> = null` es null, o sea false:
-- el default es no ver nada. Misma semantica que ya tiene `finca_id` null.
create or replace function private.organizacion_del_usuario()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.organizacion_id
  from public.usuario u
  where u.auth_user_id = auth.uid()
    and u.activo = true;
$$;

revoke execute on function private.organizacion_del_usuario() from public, anon;
grant execute on function private.organizacion_del_usuario() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Backfill
-- ---------------------------------------------------------------------------
-- Todo lo que hay hoy (las 3 fincas de produccion y sus usuarios) es una sola empresa.
--
-- OJO: `nombre` es un placeholder. Corregirlo antes de `supabase db push`, o despues con
--   update public.organizaciones set nombre = '<nombre real>' where slug = 'birrisito';
-- El `slug` en cambio no se toca a la ligera: es el prefijo de los ids de finca nuevos.
insert into public.organizaciones (nombre, slug)
values ('Organizacion Birrisito', 'birrisito');

update public.fincas
   set organizacion_id = (select id from public.organizaciones where slug = 'birrisito');

update public.usuario
   set organizacion_id = (select id from public.organizaciones where slug = 'birrisito');

-- Ahora si: una finca sin organizacion es una finca que ninguna policy puede alcanzar.
alter table public.fincas
  alter column organizacion_id set not null;

-- La organizacion la sella la base, no el cliente: mismo criterio que `registrado_por` en
-- registros_trabajo (decision 10). El front nunca la manda, asi que no hay forma de que un
-- admin intente crear una finca en otra organizacion "por error de la UI" — y el with check
-- de la policy sigue estando igual, como segunda linea.
--
-- Va DESPUES del backfill a proposito: durante la migracion no hay auth.uid(), la funcion
-- devolveria null y el not null de arriba abortaria.
alter table public.fincas
  alter column organizacion_id set default private.organizacion_del_usuario();

-- ---------------------------------------------------------------------------
-- 5. Policy de `organizaciones`
-- ---------------------------------------------------------------------------
-- Una sola policy permissive por tabla y accion (advisor 0006), y la llamada envuelta en
-- (select ...) para que el planner la resuelva como InitPlan una sola vez (advisor 0003).
create policy organizaciones_select_propia on public.organizaciones
  for select to authenticated
  using (id = (select private.organizacion_del_usuario()));

commit;
