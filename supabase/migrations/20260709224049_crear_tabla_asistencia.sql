begin;

-- una fila = trabajador marcado ausente ese dia. sin fila = presente/pendiente (default implicito).
create table public.asistencia (
  id uuid primary key default gen_random_uuid(),
  finca_id text not null references public.fincas(id),
  trabajador_id uuid not null references public.trabajadores(id),
  fecha date not null,
  registrado_por uuid not null references public.usuario(id) default public.usuario_actual_id(),
  creado_en timestamptz not null default now(),
  constraint asistencia_unico_por_dia unique (trabajador_id, fecha)
);

create index asistencia_finca_fecha_idx
  on public.asistencia (finca_id, fecha);

alter table public.asistencia enable row level security;

create policy "asistencia_select_own_finca"
  on public.asistencia
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.finca_id = asistencia.finca_id
        and usuario.activo = true
    )
  );

create policy "asistencia_insert_own_finca"
  on public.asistencia
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.finca_id = asistencia.finca_id
        and usuario.activo = true
    )
  );

create policy "asistencia_delete_own_finca"
  on public.asistencia
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.finca_id = asistencia.finca_id
        and usuario.activo = true
    )
  );

grant select, insert, delete on table public.asistencia to authenticated;

commit;
