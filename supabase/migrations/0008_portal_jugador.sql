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
