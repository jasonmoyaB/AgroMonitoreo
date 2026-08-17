begin;

-- El invitado nacia en 'birrisito' por dos caminos a la vez: el default de la columna
-- y el literal que el trigger pasa explicitamente. Con una sola finca no se notaba;
-- con dos, cada invitado entra viendo trabajadores, asistencia y traslados de una
-- finca que no es la suya hasta que el admin lo corrija. El default seguro es ninguna.
--
-- No hay que tocar ninguna policy: todas comparan usuario.finca_id = <tabla>.finca_id,
-- y `null = 'birrisito'` es null, no true. Verificado en local contra la cadena completa:
-- sin finca, registros_trabajo y asistencia devuelven 0 filas, el insert en trabajadores
-- lo rechaza la RLS y el update afecta 0 filas.
--
-- La excepcion conocida es la lectura de trabajadores: trabajadores_select_activos_multi_finca
-- (20260724174931) es `using (activo = true)` sin scoping de finca porque traslados
-- necesita listar trabajadores ajenos, asi que un usuario sin finca igual ve los nombres
-- de los activos por /rest/v1/trabajadores. No es nuevo ni lo empeora esto: le pasa a
-- cualquier supervisor. Y es estrictamente menos de lo que veia antes, cuando nacia
-- dentro de birrisito con acceso de lectura y escritura a todo.
--
-- Solo afecta a los que entren de ahora en adelante: quitar el default y el not null
-- no reescribe las filas existentes.
alter table public.usuario
  alter column finca_id drop not null,
  alter column finca_id drop default;

-- Mismo criterio que 20260708183000: rol y finca no salen de raw_user_meta_data, que
-- es del cliente y no se confia. Lo unico que cambia es que finca_id ya no se inventa
-- server-side tampoco; queda null y lo asigna el admin desde /admin/supervisores.
--
-- search_path se deja en 'public' a proposito: este trigger es el unico camino de alta
-- de la app (enable_signup = false), y endurecerlo a '' no se puede probar con
-- `db reset`, que no crea usuarios de auth. Si se cambia, probarlo con una invitacion real.
create or replace function public.crear_usuario_desde_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario_rol_id uuid;
begin
  select roles.id
    into usuario_rol_id
  from public.roles
  where roles.nombre = 'supervisor';

  if usuario_rol_id is null then
    raise exception 'Rol de usuario no encontrado: supervisor';
  end if;

  -- finca_id se omite: sin default, la fila nace con null.
  insert into public.usuario (auth_user_id, email, rol_id)
  values (new.id, new.email, usuario_rol_id);

  return new;
end;
$$;

commit;
