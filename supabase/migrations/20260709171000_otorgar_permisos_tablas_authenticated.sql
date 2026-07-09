begin;

grant usage on schema public to authenticated;

grant select, insert, update, delete on table
  public.roles,
  public.fincas,
  public.trabajadores,
  public.labores,
  public.usuario,
  public.registros_trabajo
to authenticated;

commit;
