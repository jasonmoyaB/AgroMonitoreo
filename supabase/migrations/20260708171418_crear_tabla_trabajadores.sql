begin;

create table public.trabajadores (
  id uuid primary key default gen_random_uuid(),
  finca_id text not null references public.fincas(id),
  nombre_completo text not null check (length(btrim(nombre_completo)) > 0),
  foto_url text,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint trabajadores_finca_nombre_unique unique (finca_id, nombre_completo)
);

create index trabajadores_finca_activo_idx
  on public.trabajadores (finca_id, activo);

alter table public.trabajadores enable row level security;

create policy "trabajadores_select_authenticated"
  on public.trabajadores
  for select
  to authenticated
  using (activo = true);

insert into public.trabajadores (finca_id, nombre_completo) values
  ('birrisito', 'ALONZO LOZA'),
  ('birrisito', 'ALVIN ALCANTARA'),
  ('birrisito', 'BILOMAR URBINA'),
  ('birrisito', 'CARLOS ANTHONIO JIMENEZ'),
  ('birrisito', 'CESAR POLANCO'),
  ('birrisito', 'DEIVIN TERCERO'),
  ('birrisito', 'ELVIN GARCIA ROSTRAON'),
  ('birrisito', 'ELVIS FLORES'),
  ('birrisito', 'ELYAZAR TERCERO'),
  ('birrisito', 'GABRIEL VEGA'),
  ('birrisito', 'HAXEL ZUAREZ'),
  ('birrisito', 'HECTOR DIAS'),
  ('birrisito', 'HOLLMAN ZAPATA'),
  ('birrisito', 'Jason'),
  ('birrisito', 'JEFRAN POLANCO'),
  ('birrisito', 'Jefry jardin'),
  ('birrisito', 'JOSE ANTONIO VAZQUEZ'),
  ('birrisito', 'JOSE DAMIEL LOZA'),
  ('birrisito', 'JOSE DENIS PASTRAN'),
  ('birrisito', 'JUAM AMTONIO SOSA'),
  ('birrisito', 'JUAN CARLOS AMADOR'),
  ('birrisito', 'JUAN CARLOS ROMERO'),
  ('birrisito', 'JUAN FIDENCIO'),
  ('birrisito', 'KEVIB SUAREZ'),
  ('birrisito', 'MARLON LOPEZ'),
  ('birrisito', 'MARVEN JARQUIN'),
  ('birrisito', 'MAYNOR AGUILAR'),
  ('birrisito', 'MAYNOR POLANCO PEREZ'),
  ('birrisito', 'MILTON GONZALES ZAPATA'),
  ('birrisito', 'MOISES RUIZ FLORES'),
  ('birrisito', 'NARLON ANTONIO MENDEZ'),
  ('birrisito', 'NORLAN CHACON'),
  ('birrisito', 'OLIVER PINEDA RUIZ'),
  ('birrisito', 'OSCAR AGUILAR'),
  ('birrisito', 'OSCAR PICADO DAVILA'),
  ('birrisito', 'SERGIO GUZMAN'),
  ('birrisito', 'WILMER ALTAMIRANO'),
  ('birrisito', 'YERIL MANUEL ZAPATA');

commit;
