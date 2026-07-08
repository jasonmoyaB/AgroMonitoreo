begin;

create table public.fincas (
  id text primary key,
  nombre text not null check (length(btrim(nombre)) > 0),
  activa boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table public.fincas enable row level security;

create policy "fincas_select_authenticated"
  on public.fincas
  for select
  to authenticated
  using (activa = true);

insert into public.fincas (id, nombre, activa) values
  ('birrisito', 'Birrisito', true);

commit;
