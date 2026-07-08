begin;

create table public.labores (
  id text primary key,
  codigo text not null unique check (length(btrim(codigo)) > 0),
  nombre text not null check (length(btrim(nombre)) > 0),
  icono text not null check (icono in (
    'wheat',
    'link',
    'scissors',
    'leaf',
    'knife',
    'shovel',
    'sprout',
    'package'
  )),
  color text not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  tiene_cantidad boolean not null default true,
  unidad_medida text,
  paso_cantidad integer not null check (paso_cantidad > 0),
  orden integer not null unique check (orden > 0),
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index labores_activo_orden_idx
  on public.labores (activo, orden);

alter table public.labores enable row level security;

create policy "labores_select_authenticated"
  on public.labores
  for select
  to authenticated
  using (activo = true);

insert into public.labores (
  id,
  codigo,
  nombre,
  icono,
  color,
  tiene_cantidad,
  unidad_medida,
  paso_cantidad,
  orden
) values
  ('cosecha', 'cosecha', 'Cosecha', 'wheat', '#16a34a', true, 'cajas', 1, 1),
  ('amarre_1', 'amarre_1', 'Amarre 1', 'link', '#2563eb', true, 'tramos', 1, 2),
  ('amarre_2', 'amarre_2', 'Amarre 2', 'link', '#0891b2', true, 'tramos', 1, 3),
  ('amarre_3', 'amarre_3', 'Amarre 3', 'link', '#7c3aed', true, 'tramos', 1, 4),
  ('amarre_4', 'amarre_4', 'Amarre 4', 'link', '#c026d3', true, 'tramos', 1, 5),
  ('deshija', 'deshija', 'Deshija', 'scissors', '#dc2626', true, 'tramos', 1, 6),
  ('deshoja', 'deshoja', 'Deshoja', 'leaf', '#65a30d', true, 'tramos', 1, 7),
  ('despunte', 'despunte', 'Despunte', 'knife', '#ea580c', true, 'tramos', 1, 8),
  ('palea', 'palea', 'Palea', 'shovel', '#78716c', true, 'tramos', 1, 9),
  ('deshierba', 'deshierba', 'Deshierba', 'sprout', '#ca8a04', true, 'tramos', 1, 10),
  ('emplasticado', 'emplasticado', 'Emplasticado', 'package', '#0d9488', true, 'tramos', 1, 11);

commit;
