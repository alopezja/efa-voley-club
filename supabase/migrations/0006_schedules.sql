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
