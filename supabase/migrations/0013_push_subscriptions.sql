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
