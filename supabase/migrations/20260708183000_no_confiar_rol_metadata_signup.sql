begin;

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

  insert into public.usuario (auth_user_id, email, rol_id, finca_id)
  values (new.id, new.email, usuario_rol_id, 'birrisito');

  return new;
end;
$$;

commit;
