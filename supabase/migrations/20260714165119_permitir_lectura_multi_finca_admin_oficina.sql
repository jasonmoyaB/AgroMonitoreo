begin;

-- fincas: admin_oficina puede crear y (des)activar fincas (no habia insert/update policy hasta ahora)
create policy "fincas_insert_admin_oficina"
  on public.fincas for insert to authenticated
  with check (
    exists (
      select 1 from public.usuario u
      join public.roles r on r.id = u.rol_id
      where u.auth_user_id = auth.uid() and u.activo = true and r.nombre = 'admin_oficina'
    )
  );

grant select, insert, update, delete on table public.fincas to authenticated;
grant select on table public.trabajadores to authenticated;
grant select on table public.asistencia to authenticated;
grant select on table public.registros_trabajo to authenticated;

create policy "fincas_update_admin_oficina"
  on public.fincas for update to authenticated
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

-- lectura cross-finca para admin_oficina, aditivo: no reemplaza las policies scoped-to-own-finca del supervisor
create policy "trabajadores_select_admin_oficina"
  on public.trabajadores for select to authenticated
  using (
    exists (
      select 1 from public.usuario u
      join public.roles r on r.id = u.rol_id
      where u.auth_user_id = auth.uid() and u.activo = true and r.nombre = 'admin_oficina'
    )
  );

create policy "asistencia_select_admin_oficina"
  on public.asistencia for select to authenticated
  using (
    exists (
      select 1 from public.usuario u
      join public.roles r on r.id = u.rol_id
      where u.auth_user_id = auth.uid() and u.activo = true and r.nombre = 'admin_oficina'
    )
  );

create policy "registros_trabajo_select_admin_oficina"
  on public.registros_trabajo for select to authenticated
  using (
    exists (
      select 1 from public.usuario u
      join public.roles r on r.id = u.rol_id
      where u.auth_user_id = auth.uid() and u.activo = true and r.nombre = 'admin_oficina'
    )
  );

commit;
