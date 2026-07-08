create table public.roles (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  creado_en timestamptz not null default now()
);

insert into public.roles (nombre) values
  ('admin_oficina'),
  ('supervisor');

alter table public.roles enable row level security;

create policy "roles_select_authenticated"
  on public.roles
  for select
  to authenticated
  using (true);
