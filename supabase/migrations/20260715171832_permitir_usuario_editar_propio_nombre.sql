begin;

-- permite que cualquier usuario autenticado edite su propia fila (pantalla "Configuración")
create policy "usuario_update_own"
  on public.usuario for update to authenticated
  using ( auth_user_id = auth.uid() )
  with check ( auth_user_id = auth.uid() );

-- guarda contra escalada de privilegios: un usuario no-admin no puede tocar
-- rol_id/finca_id/activo de su propia fila via la policy anterior, solo nombre.
-- admin_oficina queda exento (ya gestiona esos campos para otros usuarios).
create or replace function public.evitar_escalada_privilegios_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.es_admin_oficina() then
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

revoke execute on function public.evitar_escalada_privilegios_usuario() from public;

create trigger evitar_escalada_privilegios_usuario
  before update on public.usuario
  for each row execute function public.evitar_escalada_privilegios_usuario();

commit;
