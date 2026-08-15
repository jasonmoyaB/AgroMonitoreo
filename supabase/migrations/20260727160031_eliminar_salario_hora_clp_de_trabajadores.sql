begin;

-- `if exists` porque salario_hora_clp nunca la creo ninguna migracion: existia solo
-- en el proyecto remoto, agregada a mano. Sin esto la cadena entera revienta aca en
-- `supabase db reset` (42703) y no hay forma de arreglarlo con una migracion nueva,
-- porque el error corta antes de llegar a ella. En remoto ya se aplico, asi que el
-- `if exists` no cambia nada alla.
alter table public.trabajadores
  drop column if exists salario_hora_clp;

commit;
