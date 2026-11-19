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
