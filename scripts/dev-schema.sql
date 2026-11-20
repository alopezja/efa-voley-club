-- ============================================
-- 0001_init.sql
-- ============================================
-- Extensiones
create extension if not exists "pgcrypto";

-- Enums
create type content_status as enum ('borrador', 'publicado');
create type player_status as enum ('pendiente', 'aprobado', 'rechazado');
create type gallery_type as enum ('foto', 'video');

-- Perfiles de admin (enlazados a auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- Jugadores
create table players (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  fecha_nacimiento date,
  genero text,
  categoria text,
  documento text,
  email text,
  telefono text,
  contacto_emergencia text,
  estado player_status not null default 'pendiente',
  aprobado_por uuid references auth.users(id),
  fecha_aprobacion timestamptz,
  created_at timestamptz not null default now()
);

-- Noticias / artículos
create table articles (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  resumen text,
  cuerpo text,
  imagen_portada_url text,
  autor text,
  estado content_status not null default 'borrador',
  fecha_publicacion timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Convocatorias
create table convocatorias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  fecha_torneo timestamptz,
  lugar text,
  categoria text,
  descripcion text,
  imagen_portada_url text,
  estado content_status not null default 'borrador',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Galería
create table gallery_items (
  id uuid primary key default gen_random_uuid(),
  tipo gallery_type not null,
  titulo text,
  descripcion text,
  url text,            -- archivo en R2 (foto o video)
  enlace_youtube text, -- alternativa para video
  categoria text,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

-- Mensajes de contacto
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  mensaje text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

-- Contenido editable (ej: "Nosotros")
create table site_content (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);


-- ============================================
-- 0002_rls.sql
-- ============================================
-- Activar RLS en todo
alter table profiles enable row level security;
alter table players enable row level security;
alter table articles enable row level security;
alter table convocatorias enable row level security;
alter table gallery_items enable row level security;
alter table contact_messages enable row level security;
alter table site_content enable row level security;

-- Helper: ¿el usuario actual es admin?
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid());
$$;

-- Lectura pública de contenido publicado
create policy "articles publicados visibles" on articles
  for select using (estado = 'publicado' or is_admin());
create policy "convocatorias publicadas visibles" on convocatorias
  for select using (estado = 'publicado' or is_admin());
create policy "galeria visible" on gallery_items
  for select using (true);
create policy "site_content visible" on site_content
  for select using (true);

-- Escritura solo admin
create policy "admin escribe articles" on articles
  for all using (is_admin()) with check (is_admin());
create policy "admin escribe convocatorias" on convocatorias
  for all using (is_admin()) with check (is_admin());
create policy "admin escribe galeria" on gallery_items
  for all using (is_admin()) with check (is_admin());
create policy "admin escribe site_content" on site_content
  for all using (is_admin()) with check (is_admin());

-- Jugadores: cualquiera puede insertar (auto-registro); solo admin lee/edita
create policy "registro publico de jugadores" on players
  for insert with check (estado = 'pendiente');
create policy "admin gestiona jugadores" on players
  for select using (is_admin());
create policy "admin edita jugadores" on players
  for update using (is_admin()) with check (is_admin());

-- Contacto: cualquiera inserta; solo admin lee
create policy "contacto publico" on contact_messages
  for insert with check (true);
create policy "admin lee contacto" on contact_messages
  for select using (is_admin());

-- Profiles: cada admin ve su fila
create policy "perfil propio" on profiles
  for select using (id = auth.uid());


-- ============================================
-- 0003_seed_site_content.sql
-- ============================================
insert into site_content (key, value) values
  ('nosotros_titulo', 'Sobre EFA Voley Club'),
  ('nosotros_cuerpo', 'Eso Fue Adentro nació como un club de la comunidad, para quienes quieren jugar vóley por el simple gusto de jugar. Creemos que practicar deporte no debería tener edad: por eso abrimos la cancha tanto a jóvenes como a adultos que no encuentran dónde jugar. Aquí no exigimos alto rendimiento; buscamos movernos, compartir y disfrutar este deporte en comunidad.')
on conflict (key) do nothing;


-- ============================================
-- 0004_auth_profile_trigger.sql
-- ============================================
-- Crea automáticamente un perfil (rol admin) para cada nuevo usuario de auth.
-- Nota: en v1 solo se crean usuarios admin manualmente, así que todo auth.user es admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================
-- 0005_challenges.sql
-- ============================================
-- Retos: un equipo o persona reta al club a jugar. Inserción pública; lectura/edición solo admin.
create table challenges (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,            -- quién reta (persona de contacto)
  equipo text,                     -- nombre del equipo (opcional)
  categoria text,                  -- categoría del partido: Masculino / Femenino / Mixto
  email text,
  telefono text,
  fecha_propuesta text,            -- fecha/hora propuesta (texto libre)
  lugar text,                      -- lugar propuesto (opcional)
  mensaje text,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

alter table challenges enable row level security;

create policy "retos publicos" on challenges
  for insert with check (true);
create policy "admin lee retos" on challenges
  for select using (is_admin());
create policy "admin edita retos" on challenges
  for update using (is_admin()) with check (is_admin());
create policy "admin borra retos" on challenges
  for delete using (is_admin());


-- ============================================
-- 0006_schedules.sql
-- ============================================
-- Horarios de juego ("Dónde y cuándo jugamos"). Editable desde el panel.
-- Lectura pública; escritura solo admin.
create table schedules (
  id uuid primary key default gen_random_uuid(),
  dia text not null,               -- ej: "Martes"
  horario text,                    -- ej: "8:00 – 11:00 pm"
  lugar text,                      -- ej: "Cancha de Manila"
  descripcion text,                -- nota opcional (ej: entrada, indicaciones)
  maps_url text,                   -- enlace de Google Maps (opcional)
  orden int not null default 0,
  created_at timestamptz not null default now()
);

alter table schedules enable row level security;

create policy "horarios visibles" on schedules
  for select using (true);
create policy "admin escribe horarios" on schedules
  for all using (is_admin()) with check (is_admin());

-- Horarios actuales sembrados (puedes editarlos desde el panel)
insert into schedules (dia, horario, lugar, orden) values
  ('Martes', '8:00 – 11:00 pm', 'Cancha de Manila', 1),
  ('Viernes', '9:30 – 11:00 pm', 'Cancha Yesid Santos (Estadio)', 2);


-- ============================================
-- 0007_roles_permisos.sql
-- ============================================
-- Fase B (Parte 1): Roles (super_admin / admin / jugador) + permisos por sección.
-- Arregla el hueco de seguridad: hasta ahora el default de profiles.role era
-- 'admin', así que cualquiera que entrara quedaba admin. A partir de aquí el
-- default es 'jugador'; solo es admin quien el super_admin habilite.
--
-- Correr a mano en el SQL Editor de Supabase. Idempotente.

-- 1) Columnas nuevas en profiles -------------------------------------------
alter table public.profiles add column if not exists permisos text[] not null default '{}';
alter table public.profiles add column if not exists email text;

-- Backfill de email desde auth.users
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is distinct from u.email;

-- 2) Default de role = jugador + constraint de valores válidos --------------
alter table public.profiles alter column role set default 'jugador';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'jugador'));

-- 3) Tabla de invitaciones de administradores ------------------------------
-- El super_admin registra aquí correos + permisos. Cuando esa persona entra
-- (email o Google), el trigger le asigna el rol/permisos automáticamente.
create table if not exists public.admin_invites (
  email      text primary key,
  rol        text not null default 'admin' check (rol = 'admin'),
  permisos   text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.admin_invites enable row level security;

-- 4) Semilla: el super administrador del club ------------------------------
update public.profiles
set role = 'super_admin'
where email = 'efavoleyclub@gmail.com';

-- 5) Trigger: asigna rol/permisos al crear el usuario ----------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.admin_invites%rowtype;
  nombre_val text := coalesce(new.raw_user_meta_data->>'nombre', new.email);
begin
  if lower(new.email) = 'efavoleyclub@gmail.com' then
    insert into public.profiles (id, nombre, email, role, permisos)
    values (new.id, nombre_val, new.email, 'super_admin', '{}')
    on conflict (id) do update
      set role = 'super_admin', email = excluded.email;
    return new;
  end if;

  select * into inv from public.admin_invites where email = lower(new.email);
  if found then
    insert into public.profiles (id, nombre, email, role, permisos)
    values (new.id, nombre_val, new.email, inv.rol, inv.permisos)
    on conflict (id) do update
      set role = inv.rol, permisos = inv.permisos, email = excluded.email;
  else
    insert into public.profiles (id, nombre, email, role, permisos)
    values (new.id, nombre_val, new.email, 'jugador', '{}')
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6) Helpers de autorización -----------------------------------------------
-- is_admin: admin o super_admin (sigue cubriendo las policies de contenido).
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- 7) RLS extra para la gestión del equipo ----------------------------------
-- El super_admin puede leer todos los perfiles (para /admin/equipo).
drop policy if exists "super_admin lee perfiles" on public.profiles;
create policy "super_admin lee perfiles" on public.profiles
  for select using (is_super_admin());

-- admin_invites: solo el super_admin.
drop policy if exists "super_admin gestiona invites" on public.admin_invites;
create policy "super_admin gestiona invites" on public.admin_invites
  for all using (is_super_admin()) with check (is_super_admin());


-- ============================================
-- 0008_portal_jugador.sql
-- ============================================
-- 0008_portal_jugador.sql — Portal del Jugador (Portal 1). Correr a mano en el SQL Editor de Supabase. Idempotente.

-- 1) Equipos
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('entrenamiento', 'oficial')),
  created_at timestamptz not null default now()
);
alter table public.teams enable row level security;

-- 2) Membresías jugador↔equipo (número por equipo)
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  numero int,
  created_at timestamptz not null default now(),
  unique (team_id, player_id),
  unique (team_id, numero)
);
alter table public.team_members enable row level security;

-- 3) Columnas nuevas en players
alter table public.players add column if not exists user_id uuid references auth.users(id);
alter table public.players add column if not exists foto_url text;
alter table public.players add column if not exists posiciones text[] not null default '{}';
alter table public.players add column if not exists experiencia int check (experiencia between 1 and 10);
alter table public.players add column if not exists mano_dominante text check (mano_dominante in ('diestro', 'zurdo', 'no_se'));
alter table public.players add column if not exists disponibilidad text[] not null default '{}';
alter table public.players add column if not exists eps text;
alter table public.players add column if not exists quiere_camiseta boolean;
alter table public.players add column if not exists camiseta_color text check (camiseta_color in ('roja', 'negra', 'ambas'));
alter table public.players add column if not exists camiseta_talla text check (camiseta_talla in ('XS', 'S', 'M', 'L', 'XL', 'XXL'));
alter table public.players add column if not exists apodo text;
alter table public.players add column if not exists perfil_completo_at timestamptz;
create index if not exists idx_players_user_id on public.players(user_id);

-- 4) RLS: el jugador ve/edita SU fila; admin todo (se suma a las policies admin ya existentes)
drop policy if exists "jugador ve su player" on public.players;
create policy "jugador ve su player" on public.players
  for select using (user_id = auth.uid() or is_admin());

drop policy if exists "jugador edita su player" on public.players;
create policy "jugador edita su player" on public.players
  for update using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- teams: lectura a cualquier autenticado; escritura admin
drop policy if exists "teams lectura autenticada" on public.teams;
create policy "teams lectura autenticada" on public.teams
  for select using (auth.uid() is not null);
drop policy if exists "teams admin escribe" on public.teams;
create policy "teams admin escribe" on public.teams
  for all using (is_admin()) with check (is_admin());

-- team_members: el jugador ve las suyas y edita su número; admin todo
drop policy if exists "membresias lectura" on public.team_members;
create policy "membresias lectura" on public.team_members
  for select using (
    is_admin() or exists (
      select 1 from public.players p
      where p.id = team_members.player_id and p.user_id = auth.uid()
    )
  );
drop policy if exists "membresias admin" on public.team_members;
create policy "membresias admin" on public.team_members
  for all using (is_admin()) with check (is_admin());
drop policy if exists "membresias jugador edita numero" on public.team_members;
create policy "membresias jugador edita numero" on public.team_members
  for update using (
    exists (
      select 1 from public.players p
      where p.id = team_members.player_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.players p
      where p.id = team_members.player_id and p.user_id = auth.uid()
    )
  );


-- ============================================
-- 0009_asistencias.sql
-- ============================================
-- 0009_asistencias.sql — Portal 2: confirmación de asistencia (Voy/No voy) + molestia/lesión.
-- Correr a mano en el SQL Editor de Supabase. Idempotente.

create table if not exists public.asistencias (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  tipo text not null check (tipo in ('entreno', 'convocatoria')),
  ref_id uuid not null,              -- schedule_id o convocatoria_id
  fecha date not null,               -- fecha concreta del juego
  estado text not null check (estado in ('voy', 'no_voy')),
  molestia_zona text,                -- tobillo, rodilla, hombro, dedo, espalda, otro
  molestia_nivel text check (molestia_nivel in ('leve', 'lesion', 'no_juego')),
  molestia_nota text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (player_id, tipo, ref_id, fecha)
);
alter table public.asistencias enable row level security;

-- ¿la fila players es de este usuario?
create or replace function public.owns_player(p_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.players p where p.id = p_id and p.user_id = auth.uid());
$$;

-- El jugador ve/gestiona sus asistencias; el admin las lee todas.
drop policy if exists "asistencia lectura" on public.asistencias;
create policy "asistencia lectura" on public.asistencias
  for select using (is_admin() or public.owns_player(player_id));

drop policy if exists "asistencia inserta" on public.asistencias;
create policy "asistencia inserta" on public.asistencias
  for insert with check (public.owns_player(player_id));

drop policy if exists "asistencia actualiza" on public.asistencias;
create policy "asistencia actualiza" on public.asistencias
  for update using (public.owns_player(player_id)) with check (public.owns_player(player_id));


-- ============================================
-- 0010_convocatoria_tipo.sql
-- ============================================
-- 0010_convocatoria_tipo.sql — Tipo de evento para convocatorias (juego/torneo/amistoso).
-- Los entrenamientos recurrentes viven en `schedules`; esto clasifica los eventos con fecha.
-- Correr a mano en el SQL Editor de Supabase. Idempotente.

alter table public.convocatorias
  add column if not exists tipo text not null default 'juego'
  check (tipo in ('juego', 'torneo', 'amistoso'));


-- ============================================
-- 0011_schedule_tipo.sql
-- ============================================
-- 0011_schedule_tipo.sql — Tipo del horario recurrente: entrenamiento o juego.
-- (Ej: martes se entrena, viernes se juega, y se repite cada semana.)
-- Correr a mano en el SQL Editor de Supabase. Idempotente.

alter table public.schedules
  add column if not exists tipo text not null default 'entrenamiento'
  check (tipo in ('entrenamiento', 'juego'));


-- ============================================
-- 0012_convocados.sql
-- ============================================
-- 0012_convocados.sql — Jugadores convocados oficialmente a una convocatoria.
-- El admin elige a los convocados; a cada uno le aparece un banner en su portal.
-- Correr a mano en el SQL Editor de Supabase. Idempotente.

create table if not exists public.convocatoria_jugadores (
  convocatoria_id uuid not null references public.convocatorias(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (convocatoria_id, player_id)
);
alter table public.convocatoria_jugadores enable row level security;

-- Admin gestiona; el jugador ve sus propias convocatorias.
drop policy if exists "convocados admin" on public.convocatoria_jugadores;
create policy "convocados admin" on public.convocatoria_jugadores
  for all using (is_admin()) with check (is_admin());

drop policy if exists "convocados propio" on public.convocatoria_jugadores;
create policy "convocados propio" on public.convocatoria_jugadores
  for select using (public.owns_player(player_id));


-- ============================================
-- 0013_push_subscriptions.sql
-- ============================================
-- 0013_push_subscriptions.sql — Suscripciones de notificaciones web (Web Push).
-- Correr a mano en el SQL Editor de Supabase. Idempotente.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;

-- El jugador gestiona sus suscripciones; el admin las puede leer.
drop policy if exists "push lectura" on public.push_subscriptions;
create policy "push lectura" on public.push_subscriptions
  for select using (is_admin() or public.owns_player(player_id));

drop policy if exists "push inserta" on public.push_subscriptions;
create policy "push inserta" on public.push_subscriptions
  for insert with check (public.owns_player(player_id));

drop policy if exists "push borra" on public.push_subscriptions;
create policy "push borra" on public.push_subscriptions
  for delete using (public.owns_player(player_id));


-- ============================================
-- 0014_players_email_unico.sql
-- ============================================
-- 0014_players_email_unico.sql — Un correo solo puede registrarse una vez.
-- Índice único sobre el correo en minúsculas (ignora mayúsculas), permitiendo nulos.
-- OJO: si ya hay correos duplicados, primero hay que eliminarlos o este índice falla.
-- Correr a mano en el SQL Editor de Supabase. Idempotente.

create unique index if not exists players_email_unico
  on public.players (lower(email))
  where email is not null;




-- ============================================
-- 0015_notifications.sql
-- ============================================
-- 0015_notifications.sql — Buzón de notificaciones del jugador (bandeja persistente).
-- Correr a mano en el SQL Editor de Supabase. Idempotente.
--
-- Cada fila es un aviso que le llega a un jugador: convocatorias, recordatorios
-- de juego o avisos escritos por el admin. El push del navegador sigue existiendo;
-- esto es la copia persistente que el jugador ve en el buzón del portal.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  tipo text not null default 'aviso' check (tipo in ('aviso', 'convocatoria', 'recordatorio')),
  titulo text not null,
  cuerpo text,
  url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_player_idx
  on public.notifications (player_id, created_at desc);

alter table public.notifications enable row level security;

-- El jugador ve y gestiona las suyas; el admin las puede leer todas.
-- Las inserciones las hace el servidor (service_role), por eso no hay policy de insert.
drop policy if exists "notif lectura" on public.notifications;
create policy "notif lectura" on public.notifications
  for select using (is_admin() or public.owns_player(player_id));

drop policy if exists "notif actualiza" on public.notifications;
create policy "notif actualiza" on public.notifications
  for update using (public.owns_player(player_id)) with check (public.owns_player(player_id));

drop policy if exists "notif borra" on public.notifications;
create policy "notif borra" on public.notifications
  for delete using (public.owns_player(player_id));
