-- 0014_players_email_unico.sql — Un correo solo puede registrarse una vez.
-- Índice único sobre el correo en minúsculas (ignora mayúsculas), permitiendo nulos.
-- OJO: si ya hay correos duplicados, primero hay que eliminarlos o este índice falla.
-- Correr a mano en el SQL Editor de Supabase. Idempotente.

create unique index if not exists players_email_unico
  on public.players (lower(email))
  where email is not null;
