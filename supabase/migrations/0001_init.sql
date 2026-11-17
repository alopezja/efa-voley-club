-- Extensiones
create extension if not exists "pgcrypto";

-- Enums
create type content_status as enum ('borrador', 'publicado');
create type player_status as enum ('pendiente', 'aprobado', 'rechazado');
create type gallery_type as enum ('foto', 'video');

-- Perfiles de admin (enlazados a auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- Jugadores
create table players (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  fecha_nacimiento date,
  genero text,
  categoria text,
  documento text,
  email text,
  telefono text,
  contacto_emergencia text,
  estado player_status not null default 'pendiente',
  aprobado_por uuid references auth.users(id),
  fecha_aprobacion timestamptz,
  created_at timestamptz not null default now()
);

-- Noticias / artículos
create table articles (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  resumen text,
  cuerpo text,
  imagen_portada_url text,
  autor text,
  estado content_status not null default 'borrador',
  fecha_publicacion timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Convocatorias
create table convocatorias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  fecha_torneo timestamptz,
  lugar text,
  categoria text,
  descripcion text,
  imagen_portada_url text,
  estado content_status not null default 'borrador',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Galería
create table gallery_items (
  id uuid primary key default gen_random_uuid(),
  tipo gallery_type not null,
  titulo text,
  descripcion text,
  url text,            -- archivo en R2 (foto o video)
  enlace_youtube text, -- alternativa para video
  categoria text,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

-- Mensajes de contacto
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  mensaje text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

-- Contenido editable (ej: "Nosotros")
create table site_content (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);
