-- Fase B (Parte 1): Roles (super_admin / admin / jugador) + permisos por sección.
-- Arregla el hueco de seguridad: hasta ahora el default de profiles.role era
-- 'admin', así que cualquiera que entrara quedaba admin. A partir de aquí el
-- default es 'jugador'; solo es admin quien el super_admin habilite.
--
-- Correr a mano en el SQL Editor de Supabase. Idempotente.

-- 1) Columnas nuevas en profiles -------------------------------------------
alter table public.profiles add column if not exists permisos text[] not null default '{}';
alter table public.profiles add column if not exists email text;

-- Backfill de email desde auth.users
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is distinct from u.email;

-- 2) Default de role = jugador + constraint de valores válidos --------------
alter table public.profiles alter column role set default 'jugador';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'jugador'));

-- 3) Tabla de invitaciones de administradores ------------------------------
-- El super_admin registra aquí correos + permisos. Cuando esa persona entra
-- (email o Google), el trigger le asigna el rol/permisos automáticamente.
create table if not exists public.admin_invites (
  email      text primary key,
  rol        text not null default 'admin' check (rol = 'admin'),
  permisos   text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.admin_invites enable row level security;

-- 4) Semilla: el super administrador del club ------------------------------
update public.profiles
set role = 'super_admin'
where email = 'efavoleyclub@gmail.com';

-- 5) Trigger: asigna rol/permisos al crear el usuario ----------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.admin_invites%rowtype;
  nombre_val text := coalesce(new.raw_user_meta_data->>'nombre', new.email);
begin
  if lower(new.email) = 'efavoleyclub@gmail.com' then
    insert into public.profiles (id, nombre, email, role, permisos)
    values (new.id, nombre_val, new.email, 'super_admin', '{}')
    on conflict (id) do update
      set role = 'super_admin', email = excluded.email;
    return new;
  end if;

  select * into inv from public.admin_invites where email = lower(new.email);
  if found then
    insert into public.profiles (id, nombre, email, role, permisos)
    values (new.id, nombre_val, new.email, inv.rol, inv.permisos)
    on conflict (id) do update
      set role = inv.rol, permisos = inv.permisos, email = excluded.email;
  else
    insert into public.profiles (id, nombre, email, role, permisos)
    values (new.id, nombre_val, new.email, 'jugador', '{}')
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6) Helpers de autorización -----------------------------------------------
-- is_admin: admin o super_admin (sigue cubriendo las policies de contenido).
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- 7) RLS extra para la gestión del equipo ----------------------------------
-- El super_admin puede leer todos los perfiles (para /admin/equipo).
drop policy if exists "super_admin lee perfiles" on public.profiles;
create policy "super_admin lee perfiles" on public.profiles
  for select using (is_super_admin());

-- admin_invites: solo el super_admin.
drop policy if exists "super_admin gestiona invites" on public.admin_invites;
create policy "super_admin gestiona invites" on public.admin_invites
  for all using (is_super_admin()) with check (is_super_admin());
