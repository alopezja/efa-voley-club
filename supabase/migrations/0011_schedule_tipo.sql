-- 0011_schedule_tipo.sql — Tipo del horario recurrente: entrenamiento o juego.
-- (Ej: martes se entrena, viernes se juega, y se repite cada semana.)
-- Correr a mano en el SQL Editor de Supabase. Idempotente.

alter table public.schedules
  add column if not exists tipo text not null default 'entrenamiento'
  check (tipo in ('entrenamiento', 'juego'));
