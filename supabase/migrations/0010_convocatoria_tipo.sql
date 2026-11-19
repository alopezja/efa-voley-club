-- 0010_convocatoria_tipo.sql — Tipo de evento para convocatorias (juego/torneo/amistoso).
-- Los entrenamientos recurrentes viven en `schedules`; esto clasifica los eventos con fecha.
-- Correr a mano en el SQL Editor de Supabase. Idempotente.

alter table public.convocatorias
  add column if not exists tipo text not null default 'juego'
  check (tipo in ('juego', 'torneo', 'amistoso'));
