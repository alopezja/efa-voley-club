-- Activar RLS en todo
alter table profiles enable row level security;
alter table players enable row level security;
alter table articles enable row level security;
alter table convocatorias enable row level security;
alter table gallery_items enable row level security;
alter table contact_messages enable row level security;
alter table site_content enable row level security;

-- Helper: ¿el usuario actual es admin?
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid());
$$;

-- Lectura pública de contenido publicado
create policy "articles publicados visibles" on articles
  for select using (estado = 'publicado' or is_admin());
create policy "convocatorias publicadas visibles" on convocatorias
  for select using (estado = 'publicado' or is_admin());
create policy "galeria visible" on gallery_items
  for select using (true);
create policy "site_content visible" on site_content
  for select using (true);

-- Escritura solo admin
create policy "admin escribe articles" on articles
  for all using (is_admin()) with check (is_admin());
create policy "admin escribe convocatorias" on convocatorias
  for all using (is_admin()) with check (is_admin());
create policy "admin escribe galeria" on gallery_items
  for all using (is_admin()) with check (is_admin());
create policy "admin escribe site_content" on site_content
  for all using (is_admin()) with check (is_admin());

-- Jugadores: cualquiera puede insertar (auto-registro); solo admin lee/edita
create policy "registro publico de jugadores" on players
  for insert with check (estado = 'pendiente');
create policy "admin gestiona jugadores" on players
  for select using (is_admin());
create policy "admin edita jugadores" on players
  for update using (is_admin()) with check (is_admin());

-- Contacto: cualquiera inserta; solo admin lee
create policy "contacto publico" on contact_messages
  for insert with check (true);
create policy "admin lee contacto" on contact_messages
  for select using (is_admin());

-- Profiles: cada admin ve su fila
create policy "perfil propio" on profiles
  for select using (id = auth.uid());
