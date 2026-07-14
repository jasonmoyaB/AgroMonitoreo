begin;

-- helper security definer: evita la recursion infinita de RLS que ocurre al
-- subconsultar "usuario" dentro de una policy definida sobre la propia tabla "usuario"
create function public.es_admin_oficina()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.usuario u
    join public.roles r on r.id = u.rol_id
    where u.auth_user_id = auth.uid()
      and u.activo = true
      and r.nombre = 'admin_oficina'
  );
$$;

revoke execute on function public.es_admin_oficina() from public;
grant execute on function public.es_admin_oficina() to authenticated;

-- lectura cross-usuario para admin_oficina, aditivo: no reemplaza "usuario_select_own"
create policy "usuario_select_admin_oficina"
  on public.usuario for select to authenticated
  using ( public.es_admin_oficina() );

-- permite a admin_oficina editar nombre, rol, finca y estado de cualquier usuario
create policy "usuario_update_admin_oficina"
  on public.usuario for update to authenticated
  using ( public.es_admin_oficina() )
  with check ( public.es_admin_oficina() );

commit;
