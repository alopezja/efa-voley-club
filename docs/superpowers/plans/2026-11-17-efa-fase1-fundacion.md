# EFA Voley Club — Fase 1: Fundación · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar el proyecto Next.js desplegable en Vercel, con el sistema de diseño del club, el cliente de Supabase, el esquema de base de datos creado, la utilidad de subida a R2 y el layout base (header/footer) funcionando.

**Architecture:** Un único proyecto Next.js (App Router, TypeScript) con Tailwind CSS. Supabase provee Postgres + Auth; Cloudflare R2 almacena los archivos de medios mediante presigned URLs. Todo el contenido público se renderiza en servidor para SEO.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Supabase JS, AWS SDK S3 (cliente de R2), Vitest + React Testing Library, Zod (validación de env).

---

## Estructura de archivos (esta fase)

```
EFAVoleyClub/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout: fuentes, metadata base, Header/Footer
│   │   ├── page.tsx            # Home placeholder (hero mínimo)
│   │   └── globals.css         # Tailwind + tokens de color del club
│   ├── components/
│   │   ├── site-header.tsx     # Navegación pública
│   │   └── site-footer.tsx     # Pie
│   └── lib/
│       ├── env.ts              # Validación de variables de entorno (Zod)
│       ├── supabase/
│       │   ├── client.ts       # Cliente browser
│       │   └── server.ts       # Cliente server
│       ├── r2.ts               # Cliente R2 + presigned upload URL
│       └── slug.ts             # Utilidad slugify
├── src/lib/__tests__/
│   ├── slug.test.ts
│   └── r2.test.ts
├── supabase/
│   └── migrations/
│       └── 0001_init.sql       # Esquema completo de BD
├── .env.local.example
├── .env.local                  # (no se commitea)
├── vitest.config.ts
├── vitest.setup.ts
└── README.md
```

---

## Task 1: Scaffold del proyecto Next.js

**Files:**
- Create: todo el árbol base de Next.js en la raíz del proyecto.

- [ ] **Step 1: Crear la app Next.js en la carpeta actual**

Run (desde `/Users/alexlopez/Local Sites/EFAVoleyClub`):
```bash
npx create-next-app@15 . --typescript --tailwind --app --src-dir --import-alias "@/*" --eslint --no-turbopack --use-npm
```
Si pregunta por sobrescribir archivos existentes (`.gitignore`, `README.md`), conservar los del proyecto salvo que el paso siguiente los reemplace explícitamente. `create-next-app` no borra `docs/` ni `supabase/`.

Expected: se crean `package.json`, `src/app/`, `tailwind`, `tsconfig.json`, etc.

- [ ] **Step 2: Verificar que arranca**

Run:
```bash
npm run dev
```
Expected: servidor en `http://localhost:3000` sin errores. Detener con Ctrl+C.

- [ ] **Step 3: Verificar el build de producción**

Run:
```bash
npm run build
```
Expected: `Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js (App Router, TS, Tailwind)"
```

---

## Task 2: Configurar Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json` (scripts + devDeps)

- [ ] **Step 1: Instalar dependencias de test**

Run:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Crear `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

- [ ] **Step 3: Crear `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Añadir scripts en `package.json`**

En `"scripts"` agregar:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Smoke test**

Create `src/lib/__tests__/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("suma", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run:
```bash
npm test
```
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: configurar Vitest + React Testing Library"
```

---

## Task 3: Sistema de diseño (tokens de color y fuentes del club)

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Definir tokens en `globals.css`**

Reemplazar el contenido de `src/app/globals.css` por:
```css
@import "tailwindcss";

@theme {
  /* Paleta del club (del logo) */
  --color-efa-black: #0d0d0d;
  --color-efa-red: #d81f26;
  --color-efa-cream: #f2ece1;
  --color-efa-gray: #1a1a1a;

  --font-display: var(--font-display), system-ui, sans-serif;
  --font-body: var(--font-body), system-ui, sans-serif;
}

:root {
  color-scheme: dark;
}

body {
  background-color: var(--color-efa-black);
  color: var(--color-efa-cream);
  font-family: var(--font-body);
}

h1, h2, h3, .font-display {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.01em;
}
```

- [ ] **Step 2: Cargar fuentes en `layout.tsx`**

En `src/app/layout.tsx`, importar y aplicar fuentes de Google (display deportiva condensada + cuerpo legible):
```tsx
import { Oswald, Inter } from "next/font/google";

const display = Oswald({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
```
Y en el `<html>` del layout agregar las variables:
```tsx
<html lang="es" className={`${display.variable} ${body.variable}`}>
```

- [ ] **Step 3: Verificar build**

Run:
```bash
npm run build
```
Expected: compila sin errores.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: sistema de diseño (colores y tipografías del club)"
```

---

## Task 4: Validación de variables de entorno

**Files:**
- Create: `src/lib/env.ts`, `.env.local.example`
- Install: `zod`

- [ ] **Step 1: Instalar Zod**

```bash
npm install zod
```

- [ ] **Step 2: Crear `.env.local.example`**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2 (S3-compatible)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=

# Resend (fase posterior; puede quedar vacío ahora)
RESEND_API_KEY=
CONTACT_NOTIFY_EMAIL=
```

Copiar a `.env.local` para desarrollo local:
```bash
cp .env.local.example .env.local
```

- [ ] **Step 3: Crear `src/lib/env.ts`**

```ts
import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_BASE_URL: z.string().url(),
});

export const serverEnv = () => serverSchema.parse(process.env);

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: validación de variables de entorno con Zod"
```

---

## Task 5: Esquema de base de datos (Supabase)

**Files:**
- Create: `supabase/migrations/0001_init.sql`

> Nota: el proyecto de Supabase se crea en el dashboard (nuevo proyecto dedicado a EFA). Esta SQL se ejecuta en el **SQL Editor** de Supabase. El plan la deja versionada en el repo.

- [ ] **Step 1: Crear la migración `supabase/migrations/0001_init.sql`**

```sql
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
```

- [ ] **Step 2: Crear la migración de RLS `supabase/migrations/0002_rls.sql`**

```sql
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
```

- [ ] **Step 3: (Manual) Ejecutar en Supabase**

Ejecutar `0001_init.sql` y luego `0002_rls.sql` en el SQL Editor del proyecto EFA en Supabase. Verificar que las 8 tablas aparecen en el Table Editor.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: esquema de base de datos + RLS (migraciones Supabase)"
```

---

## Task 6: Clientes de Supabase

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Install: `@supabase/supabase-js`, `@supabase/ssr`

- [ ] **Step 1: Instalar dependencias**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Crear `src/lib/supabase/client.ts` (browser)**

```ts
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

export function createClient() {
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
```

- [ ] **Step 3: Crear `src/lib/supabase/server.ts` (server)**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Llamado desde un Server Component; se ignora (el middleware refresca)
        }
      },
    },
  });
}
```

- [ ] **Step 4: Verificar typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: clientes de Supabase (browser y server)"
```

---

## Task 7: Utilidad slug (TDD)

**Files:**
- Create: `src/lib/slug.ts`
- Test: `src/lib/__tests__/slug.test.ts`

- [ ] **Step 1: Escribir el test que falla**

`src/lib/__tests__/slug.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("pasa a minúsculas y usa guiones", () => {
    expect(slugify("Gran Torneo")).toBe("gran-torneo");
  });
  it("quita acentos", () => {
    expect(slugify("Categoría Mañana")).toBe("categoria-manana");
  });
  it("elimina caracteres especiales", () => {
    expect(slugify("¡Vamos EFA!")).toBe("vamos-efa");
  });
  it("colapsa espacios y guiones repetidos", () => {
    expect(slugify("  a   b -- c ")).toBe("a-b-c");
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run:
```bash
npx vitest run src/lib/__tests__/slug.test.ts
```
Expected: FAIL ("slugify is not defined" / no module).

- [ ] **Step 3: Implementar `src/lib/slug.ts`**

```ts
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run:
```bash
npx vitest run src/lib/__tests__/slug.test.ts
```
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: utilidad slugify con tests"
```

---

## Task 8: Cliente R2 + presigned upload URL (TDD)

**Files:**
- Create: `src/lib/r2.ts`
- Test: `src/lib/__tests__/r2.test.ts`
- Install: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`

- [ ] **Step 1: Instalar dependencias**

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

- [ ] **Step 2: Escribir el test que falla**

`src/lib/__tests__/r2.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildObjectKey, publicUrlForKey } from "@/lib/r2";

describe("buildObjectKey", () => {
  it("genera una key con carpeta, timestamp y nombre seguro", () => {
    const key = buildObjectKey("galeria", "Foto Final.JPG");
    expect(key).toMatch(/^galeria\/\d+-foto-final\.jpg$/);
  });
});

describe("publicUrlForKey", () => {
  it("une la base pública con la key", () => {
    const url = publicUrlForKey("galeria/123-foto.jpg", "https://cdn.efa.com");
    expect(url).toBe("https://cdn.efa.com/galeria/123-foto.jpg");
  });
});
```

- [ ] **Step 3: Correr el test y verificar que falla**

Run:
```bash
npx vitest run src/lib/__tests__/r2.test.ts
```
Expected: FAIL (funciones no definidas).

- [ ] **Step 4: Implementar `src/lib/r2.ts`**

```ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { serverEnv } from "@/lib/env";
import { slugify } from "@/lib/slug";

export function buildObjectKey(folder: string, filename: string): string {
  const dot = filename.lastIndexOf(".");
  const ext = dot >= 0 ? filename.slice(dot).toLowerCase() : "";
  const base = slugify(dot >= 0 ? filename.slice(0, dot) : filename) || "archivo";
  return `${folder}/${Date.now()}-${base}${ext}`;
}

export function publicUrlForKey(key: string, base: string): string {
  return `${base.replace(/\/$/, "")}/${key}`;
}

function r2Client() {
  const env = serverEnv();
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function createPresignedUpload(folder: string, filename: string, contentType: string) {
  const env = serverEnv();
  const key = buildObjectKey(folder, filename);
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(r2Client(), command, { expiresIn: 600 });
  return { uploadUrl, key, publicUrl: publicUrlForKey(key, env.R2_PUBLIC_BASE_URL) };
}
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run:
```bash
npx vitest run src/lib/__tests__/r2.test.ts
```
Expected: 2 passed (las funciones puras no requieren credenciales).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: cliente R2 y generación de presigned upload URLs"
```

---

## Task 9: Layout base (Header + Footer + Home placeholder)

**Files:**
- Create: `src/components/site-header.tsx`, `src/components/site-footer.tsx`
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Crear `src/components/site-header.tsx`**

```tsx
import Link from "next/link";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/noticias", label: "Noticias" },
  { href: "/convocatorias", label: "Convocatorias" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-efa-black/90 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-xl font-bold text-efa-cream">
          EFA <span className="text-efa-red">Voley</span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          {nav.map((i) => (
            <Link key={i.href} href={i.href} className="text-sm text-efa-cream/80 hover:text-efa-red transition-colors">
              {i.label}
            </Link>
          ))}
        </nav>
        <Link href="/registro" className="rounded bg-efa-red px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          Súmate
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Crear `src/components/site-footer.tsx`**

```tsx
export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-efa-cream/60">
        <p className="font-display text-efa-cream">ESO FUE ADENTRO · VOLEY CLUB</p>
        <p className="mt-2">© {new Date().getFullYear()} EFA Voley Club. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Insertar Header/Footer en `src/app/layout.tsx`**

Envolver `{children}` con el header y el footer y una `<main>`:
```tsx
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
// ...
<body>
  <SiteHeader />
  <main className="mx-auto max-w-6xl px-4">{children}</main>
  <SiteFooter />
</body>
```

- [ ] **Step 4: Reemplazar `src/app/page.tsx` con un hero mínimo**

```tsx
export default function Home() {
  return (
    <section className="py-24 text-center">
      <h1 className="font-display text-5xl md:text-7xl font-bold text-efa-cream">
        ESO FUE <span className="text-efa-red">ADENTRO</span>
      </h1>
      <p className="mt-4 text-lg text-efa-cream/70">Voley Club · EFA</p>
    </section>
  );
}
```

- [ ] **Step 5: Verificar build y arranque**

Run:
```bash
npm run build && npm run dev
```
Expected: build OK; en `localhost:3000` se ve el header, el hero y el footer con la paleta del club. Detener con Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: layout base (header, footer, hero inicial)"
```

---

## Task 10: Metadata base + README

**Files:**
- Modify: `src/app/layout.tsx` (export `metadata`)
- Modify: `README.md`

- [ ] **Step 1: Definir metadata base en `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "EFA Voley Club · Eso Fue Adentro",
    template: "%s · EFA Voley Club",
  },
  description: "Club de voleibol Eso Fue Adentro (EFA): noticias, convocatorias, galería e inscripciones.",
  openGraph: {
    title: "EFA Voley Club",
    description: "Club de voleibol Eso Fue Adentro (EFA).",
    type: "website",
    locale: "es_ES",
  },
};
```

- [ ] **Step 2: Escribir `README.md`**

Documentar: stack, cómo correr (`npm run dev`), variables de entorno (referir a `.env.local.example`), que Supabase y R2 requieren credenciales, y cómo ejecutar las migraciones.

- [ ] **Step 3: Verificar que todos los tests pasan**

Run:
```bash
npm test
```
Expected: todos los tests en verde.

- [ ] **Step 4: Verificar build final**

Run:
```bash
npm run build
```
Expected: `Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: metadata base de SEO y README"
```

---

## Self-review (cobertura vs. spec Fase 1)

- **Stack (Next.js + Tailwind + Supabase + R2)** → Tasks 1, 3, 6, 8 ✅
- **Sistema de diseño (colores/fuentes del logo)** → Task 3 ✅
- **Esquema de datos (8 tablas)** → Task 5 ✅
- **RLS / seguridad base** → Task 5 (0002_rls.sql) ✅
- **Presigned uploads a R2** → Task 8 ✅
- **Layout base / navegación** → Task 9 ✅
- **SEO base (metadata)** → Task 10 ✅ (sitemap/robots/JSON-LD → Fase 2)
- **Validación de entorno** → Task 4 ✅
- **Testing configurado** → Task 2 ✅

Las páginas públicas con contenido (Inicio real, Nosotros, Noticias, etc.), el auth del admin y los módulos de contenido quedan para las fases 2+.

---

## Pendientes manuales (fuera de código)

1. Crear proyecto **dedicado de EFA en Supabase** y ejecutar las migraciones.
2. Crear bucket y credenciales en **Cloudflare R2**, configurar CORS para permitir PUT desde el dominio.
3. Cargar las variables en `.env.local` (local) y en **Vercel** (producción).
4. Conectar el repo a **Vercel** y apuntar el dominio del club.
