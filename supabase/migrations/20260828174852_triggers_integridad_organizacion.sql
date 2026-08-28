-- Las tres reglas que la RLS por si sola no puede sostener.
--
-- La RLS decide QUE FILAS ve cada quien. Estos triggers sostienen invariantes sobre el
-- CONTENIDO de la fila, que una policy no puede expresar:
--
--   1. El id de una finca nueva se arma con el prefijo de su organizacion. Sin esto,
--      fincas.id sigue siendo un slug global que el admin tipea a mano, y el segundo
--      cliente que escriba 'la-esperanza' recibe un error de duplicado que le confirma que
--      el primero existe.
--   2. La finca asignada a un usuario tiene que pertenecer a su organizacion. Es un
--      trigger y NO una foreign key compuesta (finca_id, organizacion_id): una FK
--      compuesta crea un segundo camino de embed y rompe PostgREST con PGRST201, que es
--      exactamente lo que paso con datos_trabajadores (errores-conocidos.md).
--   3. Un usuario no se mueve de organizacion. Ni siquiera un admin_oficina: mover a
--      alguien de empresa es literalmente mezclar clientes.

begin;

-- ---------------------------------------------------------------------------
-- 1. Id de finca con prefijo de organizacion
-- ---------------------------------------------------------------------------

-- Sin dependencia de la extension unaccent, que no esta habilitada: las vocales acentuadas
-- y la ene se traducen a mano, que es todo lo que aparece en un nombre de finca en
-- Costa Rica.
create or replace function private.slug_texto(texto text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(
    regexp_replace(
      lower(translate(texto, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN')),
      '[^a-z0-9]+', '-', 'g'
    ),
    '-'
  );
$$;

-- security definer para que el chequeo de unicidad sea global y no solo sobre las filas
-- que la RLS le deja ver al que inserta: el id es la primary key, y una colision tiene que
-- detectarse contra la tabla entera. En schema private, como todo definer del repo
-- (decision 12b); un trigger no necesita EXECUTE del rol que dispara la sentencia.
create or replace function private.generar_id_finca()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  slug_organizacion text;
  base text;
  candidato text;
  sufijo int := 2;
begin
  -- Un id explicito se respeta: lo usan las migraciones, el seed y las 3 fincas que ya
  -- existen en produccion, que conservan su id sin prefijo.
  if new.id is not null and btrim(new.id) <> '' then
    return new;
  end if;

  select o.slug into slug_organizacion
  from public.organizaciones o
  where o.id = new.organizacion_id;

  if slug_organizacion is null then
    raise exception 'La finca debe pertenecer a una organizacion existente.';
  end if;

  base := slug_organizacion || '-' || private.slug_texto(new.nombre);

  if base = slug_organizacion || '-' then
    raise exception 'El nombre de la finca no produce un identificador valido.';
  end if;

  -- Dos fincas de la misma organizacion pueden llamarse igual; el id se desempata.
  candidato := base;
  while exists (select 1 from public.fincas f where f.id = candidato) loop
    candidato := base || '-' || sufijo;
    sufijo := sufijo + 1;
  end loop;

  new.id := candidato;
  return new;
end;
$$;

create trigger generar_id_finca
  before insert on public.fincas
  for each row execute function private.generar_id_finca();

-- ---------------------------------------------------------------------------
-- 2. La finca asignada pertenece a la organizacion del usuario
-- ---------------------------------------------------------------------------
-- Sin esto, un admin podria asignarle a un supervisor de su organizacion una finca de
-- otra empresa desde /admin/supervisores. La RLS de `usuario` no lo ve: mira la fila de
-- usuario, no a que organizacion pertenece la finca que trae la columna.
create or replace function private.validar_finca_de_organizacion_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.finca_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.fincas f
    where f.id = new.finca_id
      and f.organizacion_id = new.organizacion_id
  ) then
    raise exception 'La finca asignada no pertenece a la organizacion del usuario.';
  end if;

  return new;
end;
$$;

create trigger validar_finca_de_organizacion_usuario
  before insert or update on public.usuario
  for each row execute function private.validar_finca_de_organizacion_usuario();

-- ---------------------------------------------------------------------------
-- 3. Un usuario no cambia de organizacion
-- ---------------------------------------------------------------------------
-- Se reescribe evitar_escalada_privilegios_usuario (20260803232810) sumando la guarda de
-- organizacion ARRIBA de la rama del admin, para que tambien lo alcance a el.
--
-- null -> valor si se permite: es el unico camino de alta. El trigger de signup inserta la
-- fila sin organizacion y la edge function `invitar-usuario` la estampa despues con
-- service_role, tomandola del JWT del admin que invito. Lo que queda prohibido es mover a
-- alguien de una organizacion a otra, o dejarlo huerfano.
create or replace function public.evitar_escalada_privilegios_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.organizacion_id is not null
     and new.organizacion_id is distinct from old.organizacion_id then
    raise exception 'No se puede mover un usuario de organizacion.';
  end if;

  if private.es_admin_oficina() then
    if new.auth_user_id is distinct from old.auth_user_id then
      raise exception 'No puedes cambiar la identidad de usuario.';
    end if;
    return new;
  end if;

  if new.rol_id is distinct from old.rol_id
     or new.finca_id is distinct from old.finca_id
     or new.activo is distinct from old.activo then
    raise exception 'No tienes permiso para modificar rol, finca o estado de tu cuenta.';
  end if;

  return new;
end;
$$;

commit;
