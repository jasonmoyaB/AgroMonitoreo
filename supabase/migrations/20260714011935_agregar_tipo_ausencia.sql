begin;

alter table public.asistencia
  add column tipo text not null default 'permisos';

alter table public.asistencia
  add constraint asistencia_tipo_valido check (tipo in ('vacaciones', 'permisos', 'permisos_medicos'));

commit;
