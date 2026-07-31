begin;

create policy "trabajadores_update_admin_oficina"
  on public.trabajadores for update to authenticated
  using (
    exists (
      select 1 from public.usuario u
      join public.roles r on r.id = u.rol_id
      where u.auth_user_id = auth.uid() and u.activo = true and r.nombre = 'admin_oficina'
    )
  )
  with check (
    exists (
      select 1 from public.usuario u
      join public.roles r on r.id = u.rol_id
      where u.auth_user_id = auth.uid() and u.activo = true and r.nombre = 'admin_oficina'
    )
  );

commit;
