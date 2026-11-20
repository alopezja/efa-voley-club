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
