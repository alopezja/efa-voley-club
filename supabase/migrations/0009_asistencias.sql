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
