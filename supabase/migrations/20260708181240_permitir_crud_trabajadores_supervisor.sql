begin;

drop policy if exists "trabajadores_select_authenticated" on public.trabajadores;
drop policy if exists "trabajadores_select_own_finca" on public.trabajadores;
drop policy if exists "trabajadores_update_own_finca" on public.trabajadores;

create policy "trabajadores_select_own_finca"
  on public.trabajadores
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.finca_id = trabajadores.finca_id
        and usuario.activo = true
    )
  );

create policy "trabajadores_update_own_finca"
  on public.trabajadores
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.finca_id = trabajadores.finca_id
        and usuario.activo = true
    )
  )
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
