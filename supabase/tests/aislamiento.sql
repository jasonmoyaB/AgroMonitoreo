-- Prueba que ninguna organizacion ve datos de otra.
--
-- Es la unica garantia dura del producto multi-empresa: "jamas se puede mezclar nada con
-- otros clientes". Hasta la decision 12d eso se verificaba a mano una vez y se anotaba en un
-- .md; con dos clientes reales adentro eso no alcanza, y el dia que se agregue la tabla
-- numero once nadie va a re-verificar las otras diez.
--
-- Corre contra el STACK LOCAL, despues de `supabase db reset` (necesita las dos
-- organizaciones que siembra supabase/seed.sql):
--
--   docker exec -i supabase_db_AgroMonitoreo psql -U postgres -d postgres \
--     -v ON_ERROR_STOP=1 -f - < supabase/tests/aislamiento.sql
--
-- Cualquier fuga aborta con `FALLO: ...`. Si termina imprimiendo AISLAMIENTO OK, las tres
-- familias de chequeos pasaron:
--
--   1. Lectura   — ninguna fila ajena es visible desde ningun rol de la otra organizacion.
--   2. Vitalidad — cada rol SI ve lo suyo. Sin esto, una policy que no devuelve nada
--                  pasaria todos los chequeos de aislamiento y el test seria una mentira.
--   3. Escritura — los intentos de cruzar organizacion son rechazados, no ignorados.
--
-- Complemento obligatorio, no sustituto: este archivo habla SQL, y hay una clase de fuga
-- que solo aparece por PostgREST (embeds y PGRST201, filtros .or(), rpc). Ver el bloque de
-- verificacion manual con curl en el plan de la rama.

\set ON_ERROR_STOP on
\set QUIET on
set client_min_messages = notice;

-- ---------------------------------------------------------------------------
-- Fixture: que id pertenece a que organizacion, calculado SIN RLS
-- ---------------------------------------------------------------------------
-- Se materializa como postgres, antes de hacerse pasar por nadie. Es lo que permite
-- preguntar "de las filas que este usuario ve, cuantas son ajenas": comparar contra la
-- tabla en vivo no serviria, porque la tabla en vivo ya viene filtrada por la RLS que
-- justamente estamos poniendo a prueba.
--
-- `pk` viaja en la fila porque no todas las tablas se identifican igual:
-- salarios_trabajadores y datos_trabajadores se anclan por trabajador_id.

drop table if exists public._aislamiento_fixture;

create table public._aislamiento_fixture (
  slug  text not null,
  tabla text not null,
  pk    text not null,
  id    text not null
);

with fincas_por_org as (
  select o.slug, f.id as finca_id
  from public.organizaciones o
  join public.fincas f on f.organizacion_id = o.id
),
trabajadores_por_org as (
  select fo.slug, t.id
  from fincas_por_org fo
  join public.trabajadores t on t.finca_id = fo.finca_id
)
insert into public._aislamiento_fixture (slug, tabla, pk, id)
select slug, 'organizaciones', 'id', id::text from public.organizaciones
union all
select slug, 'fincas', 'id', finca_id from fincas_por_org
union all
select slug, 'trabajadores', 'id', id::text from trabajadores_por_org
union all
select slug, 'salarios_trabajadores', 'trabajador_id', id::text from trabajadores_por_org
union all
select tp.slug, 'datos_trabajadores', 'trabajador_id', d.trabajador_id::text
  from trabajadores_por_org tp
  join public.datos_trabajadores d on d.trabajador_id = tp.id
union all
select fo.slug, 'registros_trabajo', 'id', r.id::text
  from fincas_por_org fo join public.registros_trabajo r on r.finca_id = fo.finca_id
union all
select fo.slug, 'asistencia', 'id', a.id::text
  from fincas_por_org fo join public.asistencia a on a.finca_id = fo.finca_id
union all
select fo.slug, 'pagos_quincenales', 'id', p.id::text
  from fincas_por_org fo join public.pagos_quincenales p on p.finca_id = fo.finca_id
union all
select fo.slug, 'traslados_trabajadores', 'id', tr.id::text
  from fincas_por_org fo join public.traslados_trabajadores tr on tr.finca_origen_id = fo.finca_id
union all
select o.slug, 'usuario', 'id', u.id::text
  from public.organizaciones o join public.usuario u on u.organizacion_id = o.id;

-- La RLS de la tabla se apaga: el fixture es andamiaje del test, no un dato del dominio.
-- Solo existe en el stack local y se borra al final del archivo.
grant select on table public._aislamiento_fixture to authenticated;

-- ---------------------------------------------------------------------------
-- El motor de asercion
-- ---------------------------------------------------------------------------

create or replace function public._aislamiento_afirmar(
  etiqueta text, obtenido bigint, esperado bigint
) returns void language plpgsql as $$
begin
  if obtenido is distinct from esperado then
    raise exception 'FALLO: % -> obtenido %, esperado %', etiqueta, obtenido, esperado;
  end if;
  raise notice '  ok  %', etiqueta;
end;
$$;

-- Recorre todas las tablas del fixture para el usuario que este activo en la sesion y
-- comprueba las dos caras: cero filas ajenas, y al menos una propia cuando corresponde.
--
-- `sin_vitalidad` son las tablas que ese rol legitimamente NO debe ver ni siquiera de su
-- propia organizacion. Hoy es el caso de salarios_trabajadores para un supervisor: la
-- planilla es admin-only por diseno (20260728100100), asi que exigirle que vea algo seria
-- exigir la fuga que esa migracion cerro.
-- Drop antes del create: si una corrida anterior dejo otra firma, `create or replace` no la
-- reemplaza sino que la sobrecarga, y la llamada queda ambigua.
drop function if exists public._aislamiento_revisar(text, text, text);
drop function if exists public._aislamiento_revisar(text, text, text, text[]);

create function public._aislamiento_revisar(
  quien text, mi_slug text, otro_slug text, sin_vitalidad text[] default '{}'
)
returns void language plpgsql as $$
declare
  f record;
  visibles_ajenas bigint;
  visibles_propias bigint;
  esperadas_propias bigint;
begin
  raise notice '--- % (organizacion %) ---', quien, mi_slug;

  for f in
    select distinct tabla, pk from public._aislamiento_fixture order by tabla
  loop
    -- 1. Lectura: ni una sola fila de la otra organizacion.
    execute format(
      'select count(*) from public.%I x where x.%I::text in
         (select id from public._aislamiento_fixture where slug = $1 and tabla = $2)',
      f.tabla, f.pk
    ) into visibles_ajenas using otro_slug, f.tabla;

    perform public._aislamiento_afirmar(
      format('%s no ve %s de %s', quien, f.tabla, otro_slug), visibles_ajenas, 0::bigint
    );

    -- 2. Vitalidad: si la organizacion propia tiene filas en esa tabla, tienen que verse.
    --    Sin este chequeo, una policy rota que no devuelve NADA pasaria el punto 1.
    select count(*) into esperadas_propias
    from public._aislamiento_fixture
    where slug = mi_slug and tabla = f.tabla;

    if f.tabla = any (sin_vitalidad) then
      -- No es que "no se chequea": se chequea lo contrario. Este rol tiene que ver CERO,
      -- tambien de su propia organizacion.
      execute format(
        'select count(*) from public.%I x where x.%I::text in
           (select id from public._aislamiento_fixture where slug = $1 and tabla = $2)',
        f.tabla, f.pk
      ) into visibles_propias using mi_slug, f.tabla;

      perform public._aislamiento_afirmar(
        format('%s tampoco ve %s de su propia organizacion (es admin-only)', quien, f.tabla),
        visibles_propias, 0::bigint
      );

    elsif esperadas_propias > 0 then
      execute format(
        'select count(*) from public.%I x where x.%I::text in
           (select id from public._aislamiento_fixture where slug = $1 and tabla = $2)',
        f.tabla, f.pk
      ) into visibles_propias using mi_slug, f.tabla;

      if visibles_propias = 0 then
        raise exception 'FALLO: % no ve NINGUNA fila propia de % (hay % en la base). La policy quedo ciega, no aislada.',
          quien, f.tabla, esperadas_propias;
      end if;
      raise notice '  ok  % ve % de % propias en %', quien, visibles_propias, esperadas_propias, f.tabla;
    end if;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1 y 2. Lectura y vitalidad, desde los cuatro roles
-- ---------------------------------------------------------------------------
-- Los uuid de auth son fijos en seed.sql. `set local` los revierte al cerrar cada
-- transaccion, asi que ningun bloque contamina al siguiente.

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}';
  select public._aislamiento_revisar('admin de Birrisito', 'birrisito', 'chayotes');
commit;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}';
  select public._aislamiento_revisar('capataz de Birrisito', 'birrisito', 'chayotes', array['salarios_trabajadores']);
commit;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"20000000-0000-0000-0000-000000000003","role":"authenticated"}';
  select public._aislamiento_revisar('admin de Chayotes', 'chayotes', 'birrisito');
commit;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"20000000-0000-0000-0000-000000000004","role":"authenticated"}';
  select public._aislamiento_revisar('capataz de Chayotes', 'chayotes', 'birrisito', array['salarios_trabajadores']);
commit;

-- ---------------------------------------------------------------------------
-- 3. Escritura: cruzar organizacion tiene que ser rechazado
-- ---------------------------------------------------------------------------
-- Que no se vea una fila no implica que no se pueda escribir sobre ella: un update que
-- afecta 0 filas y un insert que la RLS rechaza son cosas distintas de un select vacio, y
-- las tres se rompen por caminos distintos.

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"20000000-0000-0000-0000-000000000004","role":"authenticated"}';

  do $$
  declare
    afectadas bigint;
  begin
    -- El capataz de Chayotes no puede dar de alta un trabajador en la finca del otro cliente.
    begin
      insert into public.trabajadores (finca_id, nombre_completo)
      values ('birrisito', 'Intruso Cross Org');
      raise exception 'FALLO: un supervisor pudo insertar un trabajador en la finca de otra organizacion.';
    exception
      when insufficient_privilege then raise notice '  ok  insert de trabajador cross-org rechazado por RLS';
    end;

    -- Tampoco puede tocar un trabajador ajeno: el update no ve la fila, afecta 0.
    update public.trabajadores set nombre_completo = 'Pisado'
    where finca_id = 'birrisito';
    get diagnostics afectadas = row_count;
    perform public._aislamiento_afirmar('update de trabajador ajeno afecta 0 filas', afectadas, 0::bigint);

    -- Ni pedir un traslado desde una finca del otro cliente.
    begin
      insert into public.traslados_trabajadores (trabajador_id, finca_origen_id, finca_destino_id, fecha, estado, solicitado_por)
      select t.id, 'birrisito', 'chayotes-la-esperanza', current_date, 'pendiente',
             (select id from public.usuario where email = 'capataz.b@dev.local')
      from public.trabajadores t where t.finca_id = 'birrisito' limit 1;

      -- Si el select interior no devolvio filas, el insert no escribio nada: tambien pasa.
      get diagnostics afectadas = row_count;
      perform public._aislamiento_afirmar('traslado cross-org no inserta', afectadas, 0::bigint);
    exception
      when insufficient_privilege then raise notice '  ok  traslado cross-org rechazado por RLS';
    end;
  end;
  $$;
rollback;

begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"20000000-0000-0000-0000-000000000003","role":"authenticated"}';

  do $$
  declare
    afectadas bigint;
    org_ajena uuid;
  begin
    -- Del fixture y no de public.organizaciones: bajo RLS este admin no puede leer la fila
    -- del vecino, asi que la consulta directa devolveria null y el insert de abajo lo
    -- rechazaria el trigger por "organizacion inexistente" — pasando el test por el motivo
    -- equivocado. Que el id no sea descubrible es correcto; aca hace falta el id real para
    -- poner a prueba la policy y no al trigger.
    select id::uuid into org_ajena
    from public._aislamiento_fixture
    where tabla = 'organizaciones' and slug = 'birrisito';

    -- El admin de Chayotes no puede crear una finca dentro de la organizacion del vecino.
    begin
      insert into public.fincas (nombre, organizacion_id) values ('Finca Robada', org_ajena);
      raise exception 'FALLO: un admin pudo crear una finca en otra organizacion.';
    exception
      when insufficient_privilege then raise notice '  ok  insert de finca en organizacion ajena rechazado por RLS';
    end;

    -- Ni desactivar una finca ajena.
    update public.fincas set activa = false where id = 'birrisito';
    get diagnostics afectadas = row_count;
    perform public._aislamiento_afirmar('update de finca ajena afecta 0 filas', afectadas, 0::bigint);

    -- Ni tocar un usuario del otro cliente.
    update public.usuario set nombre = 'Secuestrado' where email = 'capataz@dev.local';
    get diagnostics afectadas = row_count;
    perform public._aislamiento_afirmar('update de usuario ajeno afecta 0 filas', afectadas, 0::bigint);

    -- Ni llevarse a alguien de su propia organizacion a otra: lo corta el trigger, no la RLS.
    begin
      update public.usuario set organizacion_id = org_ajena where email = 'capataz.b@dev.local';
      raise exception 'FALLO: se pudo mover un usuario de organizacion.';
    exception
      when raise_exception then
        if sqlerrm like 'FALLO:%' then raise; end if;
        raise notice '  ok  mover un usuario de organizacion rechazado (%)', sqlerrm;
    end;
  end;
  $$;
rollback;

-- ---------------------------------------------------------------------------
-- 4. Storage: la foto del trabajador no puede ser publica
-- ---------------------------------------------------------------------------
-- Se comprueba la forma, no los archivos: el stack local arranca con el bucket vacio, asi
-- que un test basado en objetos pasaria en verde sin probar nada. Lo que hay que impedir es
-- que vuelva a existir un camino de lectura sin sesion.

do $$
declare
  publico bigint;
begin
  select count(*) into publico from storage.buckets
  where id = 'trabajador-fotos' and public = true;
  perform public._aislamiento_afirmar('el bucket trabajador-fotos no es publico', publico, 0::bigint);

  select count(*) into publico from pg_policies
  where schemaname = 'storage' and tablename = 'objects'
    and cmd = 'SELECT'
    and ('public' = any (roles) or 'anon' = any (roles));
  perform public._aislamiento_afirmar('ninguna policy de lectura de storage alcanza a anon/public', publico, 0::bigint);
end;
$$;

-- ---------------------------------------------------------------------------
-- Limpieza
-- ---------------------------------------------------------------------------

drop function if exists public._aislamiento_revisar(text, text, text, text[]);
drop function if exists public._aislamiento_afirmar(text, bigint, bigint);
drop table if exists public._aislamiento_fixture;

\echo ''
\echo '================================'
\echo '  AISLAMIENTO OK'
\echo '================================'
