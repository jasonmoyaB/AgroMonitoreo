begin;

insert into public.usuario (auth_user_id, email, rol_id, finca_id)
select auth_users.id, auth_users.email, roles.id, 'birrisito'
from auth.users as auth_users
cross join public.roles
where roles.nombre = 'supervisor'
  and auth_users.email is not null
  and not exists (
    select 1
    from public.usuario
    where usuario.auth_user_id = auth_users.id
  );

drop policy if exists "trabajadores_insert_own_finca" on public.trabajadores;

create policy "trabajadores_insert_own_finca"
  on public.trabajadores
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.finca_id = trabajadores.finca_id
        and usuario.activo = true
    )
  );

commit;
