begin;

-- fincas_select_authenticated (using activa = true) es la unica policy de select en fincas,
-- asi que admin_oficina no podia ver una finca recien desactivada. Eso rompia el UPDATE
-- ...RETURNING al desactivar: la fila nueva (activa = false) quedaba invisible para la
-- unica policy de select y postgres lo reporta como "new row violates row-level security
-- policy for table fincas" (42501), aunque la policy de update en si misma pasaba.
create policy "fincas_select_admin_oficina"
  on public.fincas for select to authenticated
  using ( public.es_admin_oficina() );

commit;
