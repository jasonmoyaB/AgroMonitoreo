begin;

create function public.usuario_actual_id()
returns uuid
language sql
stable
as $$
  select usuario.id
  from public.usuario
  where usuario.auth_user_id = auth.uid()
    and usuario.activo = true;
$$;

create table public.registros_trabajo (
  id uuid primary key default gen_random_uuid(),
  finca_id text not null references public.fincas(id),
  trabajador_id uuid not null references public.trabajadores(id),
  tipo_labor_id text not null references public.labores(id),
  fecha date not null,
  horas numeric(5, 2) not null check (horas >= 0),
  cantidad numeric(10, 2) check (cantidad is null or cantidad >= 0),
  registrado_por uuid not null references public.usuario(id) default public.usuario_actual_id(),
  creado_en timestamptz not null default now(),
  constraint registros_trabajo_unico_por_dia unique (trabajador_id, tipo_labor_id, fecha)
);

create index registros_trabajo_finca_fecha_idx
  on public.registros_trabajo (finca_id, fecha);

create index registros_trabajo_trabajador_idx
  on public.registros_trabajo (trabajador_id);

alter table public.registros_trabajo enable row level security;

create policy "registros_trabajo_select_own_finca"
  on public.registros_trabajo
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.finca_id = registros_trabajo.finca_id
        and usuario.activo = true
    )
  );

create policy "registros_trabajo_insert_own_finca"
  on public.registros_trabajo
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.finca_id = registros_trabajo.finca_id
        and usuario.activo = true
    )
  );

create policy "registros_trabajo_update_own_finca"
  on public.registros_trabajo
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.finca_id = registros_trabajo.finca_id
        and usuario.activo = true
    )
  )
  with check (
    exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.finca_id = registros_trabajo.finca_id
        and usuario.activo = true
    )
  );

commit;
