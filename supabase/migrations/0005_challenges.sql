-- Retos: un equipo o persona reta al club a jugar. Inserción pública; lectura/edición solo admin.
create table challenges (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,            -- quién reta (persona de contacto)
  equipo text,                     -- nombre del equipo (opcional)
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
