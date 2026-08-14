begin;

-- misma razon que salarios_trabajadores (20260728100100): RLS es row-level, no
-- column-level. trabajadores_select_activos_multi_finca (20260724174931) es
-- `using (activo = true)` sin scoping de finca, asi que cualquier columna que viva
-- en trabajadores la lee un supervisor de otra finca. la cedula es PII del
-- trabajador, no un bit del patrono como asegurado (decisiones.md 3b): va aparte.
--
-- angostar esa policy no era opcion: TRASLADO_COLUMNS usa el embed
-- trabajador:trabajadores(nombre_completo), que PostgREST resuelve contra la tabla
-- real, no contra una vista. acotarla obliga a reemplazar los embeds por queries
-- sueltas con join a mano en traslados-service.ts.
create table public.datos_trabajadores (
  trabajador_id uuid primary key references public.trabajadores(id) on delete cascade,
  finca_id text not null references public.fincas(id),
  cedula text check (cedula is null or length(btrim(cedula)) > 0),
  fecha_ingreso date,
  telefono text,
  contacto_emergencia text,
  actualizado_en timestamptz not null default now()
);

-- finca_id esta denormalizado a proposito: lo necesitan el indice unico de cedula y
-- el USING de la policy, y sin el la policy tendria que joinear a trabajadores en
-- cada fila. el FK compuesto de abajo lo vuelve imposible de desincronizar.
alter table public.trabajadores
  add constraint trabajadores_id_finca_unique unique (id, finca_id);

alter table public.datos_trabajadores
  add constraint datos_trabajadores_finca_coincide
  foreign key (trabajador_id, finca_id) references public.trabajadores(id, finca_id);

-- parcial: los trabajadores ya cargados no tienen cedula y no pueden colisionar
-- entre si por null. dos filas de la misma finca no pueden repetir una cedula real.
create unique index datos_trabajadores_finca_cedula_idx
  on public.datos_trabajadores (finca_id, cedula)
  where cedula is not null;

alter table public.datos_trabajadores enable row level security;

-- el supervisor carga estos datos desde su propio form de trabajadores, asi que
-- necesita todos los verbos sobre su finca. mismo shape que las demas policies:
-- join a usuario, nunca un chequeo de columna suelta.
create policy "datos_trabajadores_own_finca"
  on public.datos_trabajadores
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.finca_id = datos_trabajadores.finca_id
        and usuario.activo = true
    )
  )
  with check (
    exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.finca_id = datos_trabajadores.finca_id
        and usuario.activo = true
    )
  );

-- la oficina cruza todas las fincas (un dueno, varias fincas), igual que en
-- salarios_trabajadores. permissive: se OR-ea con la de arriba, no la reemplaza.
create policy "datos_trabajadores_admin_oficina"
  on public.datos_trabajadores
  for all
  to authenticated
  using (private.es_admin_oficina())
  with check (private.es_admin_oficina());

-- el hosteado otorga esto por default invisible, pero `supabase db reset` lo revoca
-- y la app 403ea en local sin que tsc ni el esquema se quejen.
grant select, insert, update, delete on table public.datos_trabajadores to authenticated;

-- actualizado_en lo sella la base, no el cliente (20260729163414, decisiones.md 10).
create trigger datos_trabajadores_tocar_actualizado_en
  before update on public.datos_trabajadores
  for each row
  execute function public.tocar_actualizado_en();

commit;
