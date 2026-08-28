-- Datos de prueba del stack local (`supabase db reset`). NUNCA llega a remoto:
-- `supabase db push` solo empuja migraciones.
--
-- Lo que ya siembran las migraciones NO se repite aca: roles (20260708164657),
-- finca 'birrisito' (20260708170000) y las 11 labores (20260708172256).
--
-- Todo es relativo a current_date: el seed tiene que seguir sirviendo dentro de
-- seis meses, y registros_trabajo rechaza fecha futura (20260819165307).
--
-- Siembra DOS organizaciones a proposito. No es adorno: el aislamiento entre clientes es
-- la garantia principal del producto, y con un solo cliente cargado una fuga de RLS no se
-- ve en pantalla hasta que ya hay dos empresas reales adentro. Con dos, cualquier mezcla
-- aparece el mismo dia, en `pnpm dev`.
--
-- Usuarios, todos con password Desarrollo123 (cumple minimum_password_length = 8 y
-- lower_upper_letters_digits):
--
--   organizacion Birrisito         organizacion Chayotes Alturas
--   ----------------------         -----------------------------
--   admin@dev.local     (oficina)  admin.b@dev.local     (oficina)
--   capataz@dev.local   (campo)    capataz.b@dev.local   (campo)
--
-- Ninguno de los dos lados puede ver nada del otro. Si alguna vez ve algo, hay un bug de
-- RLS: correr `supabase/tests/aislamiento.sql`.

begin;

-- ---------------------------------------------------------------------------
-- 0. Freno: esto nunca corre contra produccion
-- ---------------------------------------------------------------------------
-- `supabase db push --include-seed` y `supabase db reset --linked` corren este
-- archivo contra el proyecto REMOTO. Sin este freno crearian admin@dev.local,
-- con la password que esta escrita mas abajo, como admin_oficina de verdad.
-- Un comentario de advertencia no alcanza: tiene que abortar solo. El raise
-- revierte el begin; de arriba, asi que no queda nada a medias.

do $$
begin
  if exists (select 1 from public.usuario where email not like '%@dev.local') then
    raise exception 'seed.sql: esta base tiene usuarios reales, no es el stack local. Abortado.';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 1. Usuarios de auth
-- ---------------------------------------------------------------------------
-- enable_signup = false, asi que no se puede dar de alta por API: se inserta
-- directo. El trigger crear_usuario_despues_de_auth (20260708173349) crea solo
-- la fila de public.usuario, como supervisor y sin finca (20260817164409).

-- Las columnas de token van en '' y no en null: GoTrue las lee en strings de Go
-- que no aceptan null, y con null el login revienta con 500
-- "Database error querying schema", que no menciona ni la columna ni la tabla.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'admin@dev.local',
    extensions.crypt('Desarrollo123', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'capataz@dev.local',
    extensions.crypt('Desarrollo123', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', '', '', '', '', ''
  );

-- Sin fila en auth.identities el login por password falla: GoTrue busca la
-- identidad 'email' antes de validar el hash.
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  extensions.gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(), now(), now()
from auth.users u
where u.email in ('admin@dev.local', 'capataz@dev.local');

-- ---------------------------------------------------------------------------
-- 2. Rol y finca de esos usuarios
-- ---------------------------------------------------------------------------
-- evitar_escalada_privilegios_usuario (20260715171832) rechaza cambiar
-- rol_id/finca_id porque private.es_admin_oficina() da false sin auth.uid().
-- Aca corremos como owner de la tabla, asi que se apaga y se vuelve a prender.

alter table public.usuario disable trigger evitar_escalada_privilegios_usuario;

-- organizacion_id y finca_id van en el MISMO update: validar_finca_de_organizacion_usuario
-- exige que la finca asignada pertenezca a la organizacion del usuario, y evalua la fila
-- completa. Asignar la finca primero y la organizacion despues aborta.
update public.usuario
   set nombre = 'Admin Oficina (dev)',
       organizacion_id = (select id from public.organizaciones where slug = 'birrisito'),
       finca_id = 'birrisito',
       rol_id = (select id from public.roles where nombre = 'admin_oficina')
 where email = 'admin@dev.local';

update public.usuario
   set nombre = 'Capataz Birrisito (dev)',
       organizacion_id = (select id from public.organizaciones where slug = 'birrisito'),
       finca_id = 'birrisito'
 where email = 'capataz@dev.local';

alter table public.usuario enable trigger evitar_escalada_privilegios_usuario;

-- ---------------------------------------------------------------------------
-- 3. Valor hora de la finca
-- ---------------------------------------------------------------------------
-- En 0 la deduccion por ausencias no descuenta nada y parece un bug
-- (calcular-deduccion-ausencias.ts). Se cargan los dos, uno por moneda.

update public.fincas
   set valor_hora = 1750,
       valor_hora_usd = 3.50
 where id = 'birrisito';

-- ---------------------------------------------------------------------------
-- 4. Salario y datos personales de los trabajadores
-- ---------------------------------------------------------------------------
-- Los trabajadores NO se crean aca: la migracion 20260708171418 ya siembra los
-- 30 de Birrisito, y 20260728100100 les crea la fila de salario en 0. El seed
-- solo les pone numeros. Se mezclan colones y usd para ejercitar
-- redondear-por-moneda.ts en la planilla.

with numerados as (
  select id, row_number() over (order by nombre_completo) as n
  from public.trabajadores
  where finca_id = 'birrisito'
)
update public.salarios_trabajadores s
   set salario_mensual = case when numerados.n % 5 = 0 then 850 else 380000 + (numerados.n % 6) * 20000 end,
       moneda          = case when numerados.n % 5 = 0 then 'usd' else 'colones' end
  from numerados
 where s.trabajador_id = numerados.id;

-- Cedulas y telefonos inventados, distintos entre si: hay un unique parcial
-- sobre (finca_id, cedula) donde cedula is not null.
with numerados as (
  select id, row_number() over (order by nombre_completo) as n
  from public.trabajadores
  where finca_id = 'birrisito'
)
insert into public.datos_trabajadores (trabajador_id, finca_id, cedula, fecha_ingreso, telefono)
select
  id,
  'birrisito',
  '3-0' || lpad((400 + n)::text, 3, '0') || '-0' || lpad((100 + n * 3)::text, 3, '0'),
  current_date - (180 + n * 25)::int,
  '8' || lpad((300 + n * 7)::text, 3, '0') || '-' || lpad((1000 + n * 13)::text, 4, '0')
from numerados;

-- ---------------------------------------------------------------------------
-- 5. Registros de trabajo: ~2 meses, sin domingos
-- ---------------------------------------------------------------------------

with dias as (
  select d::date as fecha, row_number() over (order by d) as n
  from generate_series(current_date - 59, current_date, interval '1 day') d
  where extract(isodow from d) <> 7
),
personal as (
  select id, row_number() over (order by nombre_completo) as t
  from public.trabajadores
  where finca_id = 'birrisito'
),
tareas as (
  select id, row_number() over (order by orden) as l
  from public.labores
  where activo
)
insert into public.registros_trabajo (
  finca_id, trabajador_id, tipo_labor_id, fecha, horas, cantidad, registrado_por
)
select
  'birrisito',
  p.id,
  tareas.id,
  d.fecha,
  6 + ((d.n + p.t) % 4),
  20 + ((d.n * p.t) % 45),
  (select id from public.usuario where email = 'capataz@dev.local')
from dias d
cross join personal p
join tareas on tareas.l = ((d.n + p.t) % (select count(*) from tareas)) + 1;

-- Segunda labor el mismo dia para un trabajador: empuja el acumulado por encima
-- de las 8h de JORNADA_NORMAL_HORAS y hace aparecer horas extra.
insert into public.registros_trabajo (
  finca_id, trabajador_id, tipo_labor_id, fecha, horas, cantidad, registrado_por
)
select
  'birrisito',
  p.id,
  'deshoja',
  d::date,
  3,
  14,
  (select id from public.usuario where email = 'capataz@dev.local')
from generate_series(current_date - 13, current_date - 7, interval '1 day') d
cross join (
  select id from public.trabajadores
  where finca_id = 'birrisito'
  order by nombre_completo
  limit 1
) p
where extract(isodow from d) <> 7
  and not exists (
    select 1 from public.registros_trabajo r
    where r.trabajador_id = p.id and r.tipo_labor_id = 'deshoja' and r.fecha = d::date
  );

-- ---------------------------------------------------------------------------
-- 6. Ausencias dentro de la quincena en curso
-- ---------------------------------------------------------------------------
-- Para que /admin/planilla muestre deduccion distinta de cero. Los tres tipos,
-- que es lo que cuenta la planilla (decisiones.md 5b). Un trabajador distinto
-- por fecha: si la quincena recien arranco las tres fechas colapsan en una y el
-- unique (trabajador_id, fecha) igual no se rompe.

with quincena as (
  select case
    when extract(day from current_date) <= 15 then date_trunc('month', current_date)::date
    else date_trunc('month', current_date)::date + 15
  end as inicio
),
elegidos as (
  select id, row_number() over (order by nombre_completo) as n
  from public.trabajadores
  where finca_id = 'birrisito'
  order by nombre_completo
  limit 3
)
insert into public.asistencia (finca_id, trabajador_id, fecha, tipo, registrado_por)
select
  'birrisito',
  e.id,
  greatest(q.inicio, current_date - (3 - e.n)::int),
  case e.n when 1 then 'vacaciones' when 2 then 'permisos' else 'permisos_medicos' end,
  (select id from public.usuario where email = 'capataz@dev.local')
from quincena q
cross join elegidos e;

-- pagos_quincenales queda vacio a proposito: la quincena en curso se deja sin
-- pagar para poder probar el registro del pago y el PDF de liquidacion.

-- ---------------------------------------------------------------------------
-- 7. Segunda organizacion: Chayotes Alturas
-- ---------------------------------------------------------------------------
-- El otro cliente. Dos fincas, para que ademas se pueda probar un traslado dentro de una
-- organizacion y comprobar que no se ofrece ninguna finca de la organizacion vecina.

insert into public.organizaciones (nombre, slug)
values ('Chayotes Alturas', 'chayotes');

-- Sin `id`: lo arma el trigger generar_id_finca como <slug org>-<slug nombre>, o sea
-- 'chayotes-la-esperanza' y 'chayotes-el-alto'. Con el esquema viejo el admin lo tipeaba a
-- mano, y 'la-esperanza' habria chocado con cualquier otro cliente que usara ese nombre.
insert into public.fincas (nombre, organizacion_id, valor_hora, valor_hora_usd)
select nombre, (select id from public.organizaciones where slug = 'chayotes'), 1900, 3.80
from (values ('La Esperanza'), ('El Alto')) as f(nombre);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'admin.b@dev.local',
    extensions.crypt('Desarrollo123', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000004',
    'authenticated', 'authenticated', 'capataz.b@dev.local',
    extensions.crypt('Desarrollo123', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', '', '', '', '', ''
  );

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  extensions.gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(), now(), now()
from auth.users u
where u.email in ('admin.b@dev.local', 'capataz.b@dev.local');

alter table public.usuario disable trigger evitar_escalada_privilegios_usuario;

-- El admin de oficina queda SIN finca a proposito: administra las N fincas de su
-- organizacion y elige cual mirar en cada pantalla. Su alcance sale de organizacion_id,
-- no de finca_id — que es justamente el motivo por el que `usuario` necesita columna propia.
update public.usuario
   set nombre = 'Admin Chayotes (dev)',
       organizacion_id = (select id from public.organizaciones where slug = 'chayotes'),
       rol_id = (select id from public.roles where nombre = 'admin_oficina')
 where email = 'admin.b@dev.local';

update public.usuario
   set nombre = 'Capataz La Esperanza (dev)',
       organizacion_id = (select id from public.organizaciones where slug = 'chayotes'),
       finca_id = 'chayotes-la-esperanza'
 where email = 'capataz.b@dev.local';

alter table public.usuario enable trigger evitar_escalada_privilegios_usuario;

-- Trabajadores repartidos entre las dos fincas. Nombres distintos de los de Birrisito para
-- que una fuga se reconozca de un vistazo.
insert into public.trabajadores (finca_id, nombre_completo, activo)
values
  ('chayotes-la-esperanza', 'Wilmer Chacon Vega', true),
  ('chayotes-la-esperanza', 'Yorleny Salas Mora', true),
  ('chayotes-la-esperanza', 'Alonso Quesada Ruiz', true),
  ('chayotes-la-esperanza', 'Marisol Vargas Leon', true),
  ('chayotes-el-alto', 'Danilo Zuniga Castro', true),
  ('chayotes-el-alto', 'Kattia Rojas Pineda', true);

-- No hay trigger que cree la fila de salario: la crea quien da de alta al trabajador.
with numerados as (
  select id, row_number() over (order by nombre_completo) as n
  from public.trabajadores
  where finca_id like 'chayotes-%'
)
insert into public.salarios_trabajadores (trabajador_id, salario_mensual, moneda)
select
  id,
  case when n % 4 = 0 then 920 else 410000 + (n % 5) * 15000 end,
  case when n % 4 = 0 then 'usd' else 'colones' end
from numerados;

with numerados as (
  select id, finca_id, row_number() over (order by nombre_completo) as n
  from public.trabajadores
  where finca_id like 'chayotes-%'
)
insert into public.datos_trabajadores (trabajador_id, finca_id, cedula, fecha_ingreso, telefono)
select
  id,
  finca_id,
  '1-0' || lpad((700 + n)::text, 3, '0') || '-0' || lpad((200 + n * 5)::text, 3, '0'),
  current_date - (150 + n * 30)::int,
  '7' || lpad((400 + n * 9)::text, 3, '0') || '-' || lpad((2000 + n * 17)::text, 4, '0')
from numerados;

with dias as (
  select d::date as fecha, row_number() over (order by d) as n
  from generate_series(current_date - 44, current_date, interval '1 day') d
  where extract(isodow from d) <> 7
),
personal as (
  select id, finca_id, row_number() over (order by nombre_completo) as t
  from public.trabajadores
  where finca_id like 'chayotes-%'
),
tareas as (
  select id, row_number() over (order by orden) as l
  from public.labores
  where activo
)
insert into public.registros_trabajo (
  finca_id, trabajador_id, tipo_labor_id, fecha, horas, cantidad, registrado_por
)
select
  p.finca_id,
  p.id,
  tareas.id,
  d.fecha,
  5 + ((d.n + p.t) % 5),
  15 + ((d.n * p.t) % 60),
  (select id from public.usuario where email = 'capataz.b@dev.local')
from dias d
cross join personal p
join tareas on tareas.l = ((d.n + p.t * 2) % (select count(*) from tareas)) + 1;

-- Una ausencia, para que la deduccion de la planilla de Chayotes tampoco sea cero.
insert into public.asistencia (finca_id, trabajador_id, fecha, tipo, registrado_por)
select
  t.finca_id,
  t.id,
  greatest(
    case
      when extract(day from current_date) <= 15 then date_trunc('month', current_date)::date
      else date_trunc('month', current_date)::date + 15
    end,
    current_date - 1
  ),
  'permisos',
  (select id from public.usuario where email = 'capataz.b@dev.local')
from public.trabajadores t
where t.finca_id = 'chayotes-la-esperanza'
order by t.nombre_completo
limit 1;

commit;
