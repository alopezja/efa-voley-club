# EFA Voley Club — Fase 3: Autenticación de admin + panel base · Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development / executing-plans. Steps use `- [ ]`.

**Goal:** Login de administrador (Supabase Auth, email+contraseña), rutas `/admin/*` protegidas por middleware, un shell de panel con cierre de sesión, un dashboard con contadores, y un trigger que crea el perfil de cada admin automáticamente.

**Architecture:** Supabase Auth con `@supabase/ssr`. Un `middleware.ts` refresca la sesión y bloquea `/admin/*` sin sesión (salvo `/admin/login`). El layout de `/admin` verifica en servidor que el usuario sea admin. El dashboard lee contadores con el cliente server (RLS `is_admin()` ya existe).

**Tech Stack:** Next.js 15, @supabase/ssr, Supabase Auth, Tailwind v4.

---

## Task 1: Trigger de perfil automático (migración)

**Files:** Create `supabase/migrations/0004_auth_profile_trigger.sql`

- [ ] **Step 1:** Crear la migración (versionada; se ejecuta manual en el SQL Editor):
```sql
-- Crea automáticamente un perfil (rol admin) para cada nuevo usuario de auth.
-- Nota: en v1 solo se crean usuarios admin manualmente, así que todo auth.user es admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```
- [ ] **Step 2:** Commit: `feat: trigger de creación automática de perfil admin`.

---

## Task 2: Middleware de sesión + protección de /admin

**Files:** Create `src/lib/supabase/middleware.ts`, `src/middleware.ts`

- [ ] **Step 1:** `src/lib/supabase/middleware.ts` — `updateSession(request)` que refresca la sesión de Supabase y, si la ruta empieza por `/admin` y NO es `/admin/login` y no hay usuario, redirige a `/admin/login`:
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isAdminArea = path.startsWith("/admin");
  const isLogin = path === "/admin/login";

  if (isAdminArea && !isLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return response;
}
```
- [ ] **Step 2:** `src/middleware.ts`:
```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = { matcher: ["/admin/:path*"] };
```
- [ ] **Step 3:** `npm run build` OK. Commit: `feat: middleware de sesión y protección de /admin`.

---

## Task 3: Helper requireAdmin + página de login

**Files:** Create `src/lib/auth.ts`, `src/app/admin/login/page.tsx`, `src/components/admin/login-form.tsx`

- [ ] **Step 1 — `src/lib/auth.ts`:** `getCurrentUser()` (devuelve el user o null) y `requireAdmin()` que, en servidor, obtiene el user; si no hay o no tiene perfil admin, hace `redirect("/admin/login")`. Usa el cliente server y consulta `profiles`.
- [ ] **Step 2 — `login-form.tsx`** (Client): formulario email+contraseña que usa el cliente browser `createClient().auth.signInWithPassword(...)`; en éxito `router.push("/admin")` + `router.refresh()`; muestra error "Correo o contraseña incorrectos." en fallo. Estilo sobrio, fondo oscuro, acento rojo del club.
- [ ] **Step 3 — `/admin/login/page.tsx`:** página centrada con el logo y el `LoginForm`. `metadata` con `robots: { index: false }`. Si ya hay sesión, redirige a `/admin`.
- [ ] **Step 4:** `npm run build` OK. Commit: `feat: login de administrador`.

---

## Task 4: Shell del panel (layout protegido + cerrar sesión)

**Files:** Create `src/app/admin/layout.tsx`, `src/components/admin/admin-nav.tsx`, `src/app/admin/logout/route.ts`

- [ ] **Step 1 — `admin/layout.tsx`** (Server): llama `requireAdmin()` al inicio (protección en servidor, defensa en profundidad además del middleware). Renderiza una barra lateral (`AdminNav`) + área de contenido. Importante: este layout NO debe envolver `/admin/login` con la barra — como `login` es hijo de `/admin`, usar un **grupo de rutas**: mover el panel a `src/app/admin/(panel)/layout.tsx` y las páginas del panel dentro de `(panel)/`, dejando `admin/login` fuera del grupo. (El login tiene su propio layout mínimo.)
- [ ] **Step 2 — `AdminNav`:** enlaces del panel: Dashboard (`/admin`), y marcadores deshabilitados/"próximamente" para Noticias, Convocatorias, Galería, Jugadores, Mensajes (se activan en sus fases). Incluir botón "Cerrar sesión" que hace POST a `/admin/logout`.
- [ ] **Step 3 — `admin/logout/route.ts`** (Route Handler POST): `createClient().auth.signOut()` y redirige a `/admin/login`.
- [ ] **Step 4:** `npm run build` OK. Commit: `feat: shell del panel admin con cierre de sesión`.

---

## Task 5: Dashboard con contadores

**Files:** Create `src/app/admin/(panel)/page.tsx`

- [ ] **Step 1:** Server Component que, con el cliente server (sesión admin, RLS permite `is_admin()`), obtiene contadores con `select("*", { count: "exact", head: true })`:
  - Jugadores pendientes: `players` where `estado = 'pendiente'`.
  - Mensajes sin leer: `contact_messages` where `leido = false`.
  - Noticias publicadas: `articles` where `estado = 'publicado'`.
  - Próximas convocatorias: `convocatorias` where `fecha_torneo >= now()`.
- [ ] **Step 2:** Mostrar tarjetas simples (número grande + etiqueta). Como los módulos aún no existen, varios estarán en 0 — está bien. Encabezado "Hola" + email del admin.
- [ ] **Step 3:** `npm run build` OK. Commit: `feat: dashboard del panel con contadores`.

---

## Task 6: Verificación

- [ ] **Step 1:** `npm test` y `npm run build` verdes.
- [ ] **Step 2:** Confirmar que `/admin` sin sesión redirige a `/admin/login`, y que `/admin/login` carga sin bucle de redirección.
- [ ] **Step 3:** Merge a `main` y push (deploy).

---

## Pendientes manuales (fuera de código)

1. Ejecutar `supabase/migrations/0004_auth_profile_trigger.sql` en el SQL Editor de Supabase (ANTES de crear el usuario admin, para que el perfil se cree solo).
2. Crear el **primer usuario admin**: con la clave `service_role`/secret vía script, o en Supabase → Authentication → Add user (email del club + contraseña, marcar auto-confirm). El trigger creará su perfil.

## Self-review
- Login → Task 3 ✅ · Protección rutas → Task 2 ✅ · Shell + logout → Task 4 ✅ · Dashboard → Task 5 ✅ · Perfil auto → Task 1 ✅.
