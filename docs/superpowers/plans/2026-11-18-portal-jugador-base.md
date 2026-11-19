# Portal del Jugador — Portal 1 (Base) · Plan de implementación

> **Para quien ejecuta:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development o superpowers:executing-plans, tarea por tarea. Los pasos usan checkbox (`- [ ]`).

**Goal:** Que un jugador aprobado entre por enlace mágico y complete un perfil rico (número por equipo, posición en cancha visual, camiseta, foto, experiencia, EPS, etc.), vea su % de perfil en un anillo bonito, y que el admin gestione equipos y asigne equipo al aprobar.

**Architecture:** Next.js App Router + Supabase (Auth magic link + Postgres + RLS) + R2 (foto). Nuevas tablas `teams`/`team_members` y columnas en `players`. Acceso jugador = rol `jugador` (ya existe por 0007). Helpers puros con tests; UI verificada con Playwright.

**Tech Stack:** Next 15, React 19, TS, Tailwind v4, @supabase/ssr, @aws-sdk/client-s3, Vitest.

**Rama:** `feat/portal-jugador-base` (ya creada).

---

## Task 1: Migración 0008 (equipos, membresías, columnas de perfil, RLS)

**Files:**
- Create: `supabase/migrations/0008_portal_jugador.sql`

- [ ] **Step 1: Escribir la migración**

```sql
-- 0008_portal_jugador.sql — Portal del Jugador (Portal 1). Correr a mano en Supabase.

-- 1) Equipos
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('entrenamiento','oficial')),
  created_at timestamptz not null default now()
);
alter table public.teams enable row level security;

-- 2) Membresías jugador↔equipo (número por equipo)
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  numero int,
  created_at timestamptz not null default now(),
  unique (team_id, player_id),
  unique (team_id, numero)
);
alter table public.team_members enable row level security;

-- 3) Columnas nuevas en players
alter table public.players add column if not exists user_id uuid references auth.users(id);
alter table public.players add column if not exists foto_url text;
alter table public.players add column if not exists posiciones text[] not null default '{}';
alter table public.players add column if not exists experiencia int check (experiencia between 1 and 10);
alter table public.players add column if not exists mano_dominante text check (mano_dominante in ('diestro','zurdo','no_se'));
alter table public.players add column if not exists disponibilidad text[] not null default '{}';
alter table public.players add column if not exists eps text;
alter table public.players add column if not exists quiere_camiseta boolean;
alter table public.players add column if not exists camiseta_color text check (camiseta_color in ('roja','negra','ambas'));
alter table public.players add column if not exists camiseta_talla text check (camiseta_talla in ('XS','S','M','L','XL','XXL'));
alter table public.players add column if not exists apodo text;
alter table public.players add column if not exists perfil_completo_at timestamptz;
create index if not exists idx_players_user_id on public.players(user_id);

-- 4) RLS: jugador ve/edita SU fila; admin todo (además de las policies admin ya existentes)
drop policy if exists "jugador ve su player" on public.players;
create policy "jugador ve su player" on public.players
  for select using (user_id = auth.uid() or is_admin());
drop policy if exists "jugador edita su player" on public.players;
create policy "jugador edita su player" on public.players
  for update using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- teams
drop policy if exists "teams lectura autenticada" on public.teams;
create policy "teams lectura autenticada" on public.teams for select using (auth.uid() is not null);
drop policy if exists "teams admin escribe" on public.teams;
create policy "teams admin escribe" on public.teams for all using (is_admin()) with check (is_admin());

-- team_members
drop policy if exists "membresias lectura" on public.team_members;
create policy "membresias lectura" on public.team_members for select using (
  is_admin() or exists (select 1 from public.players p where p.id = team_members.player_id and p.user_id = auth.uid())
);
drop policy if exists "membresias admin" on public.team_members;
create policy "membresias admin" on public.team_members for all using (is_admin()) with check (is_admin());
drop policy if exists "membresias jugador edita numero" on public.team_members;
create policy "membresias jugador edita numero" on public.team_members for update using (
  exists (select 1 from public.players p where p.id = team_members.player_id and p.user_id = auth.uid())
) with check (
  exists (select 1 from public.players p where p.id = team_members.player_id and p.user_id = auth.uid())
);
```

- [ ] **Step 2: Entregar al usuario para correr en Supabase SQL Editor.** Esperar confirmación antes de probar flujos que dependan del esquema. (El `user_id` lo asigna el servidor con service_role, no el jugador.)

- [ ] **Step 3: Commit**
```bash
git add supabase/migrations/0008_portal_jugador.sql
git commit -m "feat(portal): migracion 0008 equipos + membresias + columnas de perfil"
```

---

## Task 2: Permiso de sección `equipos`

**Files:**
- Modify: `src/lib/permisos.ts` (agregar entrada `equipos`)

- [ ] **Step 1:** Añadir a `SECCIONES` (después de `horarios` o donde encaje):
```ts
{ key: "equipos", label: "Equipos", href: "/admin/equipos" },
```
- [ ] **Step 2:** `npm run build` compila. Commit: `feat(portal): seccion equipos en permisos`.

---

## Task 3: Catálogo de posiciones (helper puro + test)

**Files:**
- Create: `src/lib/positions.ts`
- Test: `src/lib/positions.test.ts`

- [ ] **Step 1: Test (falla primero)**
```ts
import { describe, it, expect } from "vitest";
import { POSICIONES, validarPosiciones } from "./positions";

describe("positions", () => {
  it("lista incluye las 5 + no_se", () => {
    expect(POSICIONES.map((p) => p.key)).toEqual(
      ["armador", "opuesto", "central", "punta", "libero", "no_se"]
    );
  });
  it("acepta hasta 2 válidas", () => {
    expect(validarPosiciones(["armador", "central"]).ok).toBe(true);
  });
  it("rechaza más de 2", () => {
    expect(validarPosiciones(["armador", "central", "punta"]).ok).toBe(false);
  });
  it("rechaza valores inválidos", () => {
    expect(validarPosiciones(["xxx"]).ok).toBe(false);
  });
  it("'no_se' es válida y única", () => {
    expect(validarPosiciones(["no_se"]).ok).toBe(true);
  });
});
```
- [ ] **Step 2: Implementar**
```ts
export const POSICIONES = [
  { key: "armador", label: "Armador(a)" },
  { key: "opuesto", label: "Opuesto(a)" },
  { key: "central", label: "Central" },
  { key: "punta", label: "Punta / Receptor" },
  { key: "libero", label: "Líbero" },
  { key: "no_se", label: "Aún no sé" },
] as const;

export type PosicionKey = (typeof POSICIONES)[number]["key"];
const KEYS = POSICIONES.map((p) => p.key) as string[];

export function validarPosiciones(xs: string[]): { ok: boolean } {
  if (xs.length === 0 || xs.length > 2) return { ok: false };
  return { ok: xs.every((x) => KEYS.includes(x)) };
}
```
- [ ] **Step 3:** `npx vitest run src/lib/positions.test.ts` → PASS. Commit.

---

## Task 4: Validación de número por equipo + sugerencia (helper puro + test)

**Files:**
- Create: `src/lib/teams-validation.ts`
- Test: `src/lib/teams-validation.test.ts`

Reglas: número entero 1–99. `numeroDisponible(numero, ocupados)` → libre si no está en `ocupados`. `sugerirNumero(preferido, ocupados)` → devuelve `preferido` si libre, si no el primer libre 1–99. `numerosLibres(ocupados)` → lista 1–99 sin los ocupados.

- [ ] **Step 1: Test (falla primero)**
```ts
import { describe, it, expect } from "vitest";
import { validarNumero, numeroDisponible, sugerirNumero, numerosLibres } from "./teams-validation";

describe("teams-validation", () => {
  it("valida rango 1-99", () => {
    expect(validarNumero(0).ok).toBe(false);
    expect(validarNumero(100).ok).toBe(false);
    expect(validarNumero(7).ok).toBe(true);
  });
  it("disponible si no está ocupado", () => {
    expect(numeroDisponible(7, [3, 10])).toBe(true);
    expect(numeroDisponible(3, [3, 10])).toBe(false);
  });
  it("sugiere el preferido si libre, si no el primero libre", () => {
    expect(sugerirNumero(7, [3, 10])).toBe(7);
    expect(sugerirNumero(3, [3, 10])).toBe(1);
  });
  it("lista los libres", () => {
    const libres = numerosLibres([1, 2, 3]);
    expect(libres).not.toContain(1);
    expect(libres[0]).toBe(4);
  });
});
```
- [ ] **Step 2: Implementar**
```ts
export function validarNumero(n: number): { ok: boolean } {
  return { ok: Number.isInteger(n) && n >= 1 && n <= 99 };
}
export function numeroDisponible(n: number, ocupados: number[]): boolean {
  return !ocupados.includes(n);
}
export function numerosLibres(ocupados: number[]): number[] {
  const set = new Set(ocupados);
  const out: number[] = [];
  for (let i = 1; i <= 99; i++) if (!set.has(i)) out.push(i);
  return out;
}
export function sugerirNumero(preferido: number | null, ocupados: number[]): number | null {
  if (preferido && numeroDisponible(preferido, ocupados) && validarNumero(preferido).ok) return preferido;
  return numerosLibres(ocupados)[0] ?? null;
}
```
- [ ] **Step 3:** vitest run → PASS. Commit.

---

## Task 5: Cálculo del % de perfil (helper puro + test)

**Files:**
- Create: `src/lib/profile-completeness.ts`
- Test: `src/lib/profile-completeness.test.ts`

`computeCompleteness(p)` recibe un objeto con los campos relevantes y devuelve `{ pct, items: {key,label,done}[], done, total }`. Ítems: foto, posiciones, experiencia, fecha_nacimiento, eps, contacto_emergencia, mano_dominante, disponibilidad, camiseta (decisión tomada: `quiere_camiseta` no nulo; si true, color+talla), numero (tiene número en al menos un equipo). Cada ítem done=booleano; pct = round(done/total*100).

- [ ] **Step 1: Test (falla primero)** — probar: perfil vacío → 0%; perfil con todos → 100%; camiseta=true sin color → ítem camiseta incompleto.
```ts
import { describe, it, expect } from "vitest";
import { computeCompleteness } from "./profile-completeness";

const vacio = {
  foto_url: null, posiciones: [], experiencia: null, fecha_nacimiento: null,
  eps: null, contacto_emergencia: null, mano_dominante: null, disponibilidad: [],
  quiere_camiseta: null, camiseta_color: null, camiseta_talla: null, tieneNumero: false,
};
const lleno = {
  foto_url: "x", posiciones: ["armador"], experiencia: 5, fecha_nacimiento: "2000-01-01",
  eps: "Sura", contacto_emergencia: "Mamá 300", mano_dominante: "diestro",
  disponibilidad: ["martes"], quiere_camiseta: true, camiseta_color: "roja",
  camiseta_talla: "M", tieneNumero: true,
};

describe("profile-completeness", () => {
  it("vacío = 0%", () => expect(computeCompleteness(vacio).pct).toBe(0));
  it("lleno = 100%", () => expect(computeCompleteness(lleno).pct).toBe(100));
  it("camiseta sí sin color queda incompleta", () => {
    const r = computeCompleteness({ ...lleno, camiseta_color: null });
    expect(r.items.find((i) => i.key === "camiseta")!.done).toBe(false);
    expect(r.pct).toBeLessThan(100);
  });
  it("no quiere camiseta cuenta como decidido", () => {
    const r = computeCompleteness({ ...lleno, quiere_camiseta: false, camiseta_color: null, camiseta_talla: null });
    expect(r.items.find((i) => i.key === "camiseta")!.done).toBe(true);
  });
});
```
- [ ] **Step 2: Implementar** — definir `CompletenessInput` type y la función (10 ítems, lógica de camiseta descrita). pct redondeado.
- [ ] **Step 3:** vitest run → PASS. Commit.

---

## Task 6: Admin — CRUD de Equipos

**Files:**
- Create: `src/lib/teams.ts` (types + `getTeams()`, `getTeamOccupiedNumbers(teamId)`, `getPlayerMemberships(playerId)`)
- Create: `src/app/admin/(panel)/equipos/page.tsx`
- Create: `src/app/admin/(panel)/equipos/actions.ts` (`crearEquipo`, `eliminarEquipo`)
- Create: `src/components/admin/equipos-manager.tsx` (client: form nombre+tipo + lista con eliminar)

Patrón: `requirePerm("equipos")` en page y actions. Escrituras con cliente normal (RLS admin permite) o `createAdminClient()` si hace falta. `tipo` como `<select>` (entrenamiento/oficial). Mostrar cuántos jugadores tiene cada equipo.

- [ ] Step 1: `teams.ts` con `getTeams()` (incluye conteo de miembros) y helpers de números ocupados.
- [ ] Step 2: actions `crearEquipo` (valida nombre no vacío + tipo válido), `eliminarEquipo`.
- [ ] Step 3: page + `equipos-manager.tsx` (useActionState directo, sin wrapper async — ver memoria del proyecto).
- [ ] Step 4: `npm run build` OK. Commit.

---

## Task 7: Aprobación asigna equipo + envía enlace mágico

**Files:**
- Modify: `src/app/admin/(panel)/jugadores/actions.ts` (`approvePlayer` ahora recibe `teamId`; crea `team_members`; genera magic link y envía correo)
- Modify: `src/app/admin/(panel)/jugadores/page.tsx` (selector de equipo por jugador pendiente)
- Modify: `src/lib/email.ts` (añadir `sendPlayerInvite`)

Detalles:
- `approvePlayer(playerId, teamId)`: `requirePerm("jugadores")`; con `createAdminClient()` marca `estado='aprobado'`, `fecha_aprobacion`, `aprobado_por`; inserta `team_members (team_id, player_id)` (numero null). Genera magic link:
  ```ts
  const { data } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: player.email,
    options: { redirectTo: `${siteUrl}/auth/callback?next=/jugador/perfil` },
  });
  const link = data.properties?.action_link;
  ```
  Luego `await sendPlayerInvite(player.email, player.nombre, link)`. Si no hay email, omitir envío.
- `sendPlayerInvite(email, nombre, link)` en email.ts: usa Resend (from `EFA Voley Club <onboarding@resend.dev>` por ahora; cuando se verifique el dominio se cambia a `club@efavoleyclub.com`). Asunto "¡Bienvenido/a al club! Completa tu perfil". Cuerpo con saludo + CTA al link.
- page: cada jugador pendiente muestra un `<select>` de equipos + botón "Aprobar" (form con hidden teamId). Si no hay equipos, mostrar aviso "Crea un equipo primero" con link a /admin/equipos.
- **Fallback sin dominio verificado:** tras aprobar, mostrar en el panel el enlace mágico generado (copiable) para pruebas.

- [ ] Steps: implementar email helper → actions → page → `npm run build` → commit.

---

## Task 8: Acceso jugador (magic link) + callback

**Files:**
- Create: `src/app/(site)/acceso/page.tsx` (form: correo → enviar enlace)
- Create: `src/app/(site)/acceso/actions.ts` (`enviarEnlace` → `supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo }})`)
- Create: `src/app/auth/callback/route.ts` (exchangeCodeForSession, redirect a `next` o `/jugador`)
- Modify: `src/lib/auth.ts` (añadir `requireJugador()` → sesión con perfil rol jugador; si admin, redirige a /admin; si anónimo, a /acceso)

- [ ] Step 1: `/auth/callback/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/jugador";
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
```
- [ ] Step 2: `/acceso` page + action (signInWithOtp con `emailRedirectTo = ${origin}/auth/callback?next=/jugador`). Mensaje "Te enviamos un enlace a tu correo".
- [ ] Step 3: `requireJugador()` en auth.ts.
- [ ] Step 4: build OK. Commit.

---

## Task 9: Portal del jugador (layout + home con anillo) + enlace player↔cuenta

**Files:**
- Create: `src/app/jugador/layout.tsx` (requireJugador + vincula players.user_id por email en el primer ingreso)
- Create: `src/app/jugador/page.tsx` (home: saludo, anillo de %, botón invitar WhatsApp)
- Create: `src/components/jugador/completeness-ring.tsx` (anillo SVG + checklist + mensajes)
- Create: `src/lib/player-profile.ts` (`getMiPlayer()` por user_id; `linkPlayerByEmail(userId, email)` con createAdminClient)

Detalles:
- layout: `const { user } = await requireJugador();` luego `await linkPlayerByEmail(user.id, user.email)` (si existe players con ese email y user_id null → set user_id; service_role).
- home: cargar player + membresías; `computeCompleteness(...)`; render `CompletenessRing`. Si no hay player vinculado (caso raro), mensaje amable.
- Botón WhatsApp: `https://wa.me/?text=<mensaje url-encoded con link de registro>`.
- `CompletenessRing`: SVG circular con `stroke-dasharray` según pct; lista de ítems (✓/○) con labels; mensaje motivacional según pct. Diseño on-brand (usar skill frontend-design al construir).

- [ ] Steps: player-profile.ts → ring component → layout → page → build → commit.

---

## Task 10: Formulario de perfil + cancha visual + guardar

**Files:**
- Create: `src/app/jugador/perfil/page.tsx` (carga player + equipos + números ocupados; render form)
- Create: `src/app/jugador/perfil/actions.ts` (`guardarPerfil`: valida y guarda todo; número por equipo; sube foto a R2)
- Create: `src/components/jugador/profile-form.tsx` (client: todos los campos)
- Create: `src/components/jugador/court-positions.tsx` (client: cancha SVG, selección máx 2)
- Create: `src/components/jugador/experience-slider.tsx` (client: barra 1–10 con texto del nivel)

Detalles del form (todos obligatorios, con "No sé"):
- Foto: input file → compresión cliente (reutilizar `src/lib/compress-image.ts`) → se sube en la action a R2 (`uploadToR2('jugadores', ...)`). Previsualización inmediata.
- Cancha: `court-positions.tsx` dibuja media cancha de vóley con zonas; tocar resalta; máx 2 (si elige 'no_se' se limpia el resto). Envía `posiciones` como inputs ocultos.
- Experiencia: `experience-slider.tsx` range 1–10; debajo el texto del nivel (anclas de la spec).
- Número: input por cada equipo del jugador; muestra números libres y valida al guardar. Sugerir el mismo número en ambos equipos.
- Camiseta: ¿quieres? (sí/no); si sí, color (roja/negra/ambas) + talla (XS–XXL) + apodo.
- Edad: fecha de nacimiento (date).
- EPS (texto), contacto de emergencia (texto), mano dominante (diestro/zurdo/no_se), disponibilidad (checkboxes martes/viernes desde horarios).

`guardarPerfil`:
- `requireJugador()`, obtener su player por user_id.
- Validar posiciones (`validarPosiciones`), experiencia (1–10), número por equipo (`validarNumero` + unicidad consultando `team_members` del equipo).
- Subir foto si viene nueva.
- Update `players` + upsert número en `team_members` por equipo.
- Recalcular completitud; si 100% y `perfil_completo_at` null, setearlo.
- Mensaje de guardado + errores por campo (patrón useState + action directo, sin wrapper async — ver memoria).

- [ ] Steps: court component → experience slider → profile-form → actions → page → build → commit.

---

## Task 11: Admin ve el % por jugador

**Files:**
- Modify: `src/app/admin/(panel)/jugadores/page.tsx` + `src/lib/players.ts`

- [ ] Step 1: `getPlayers()` trae los campos para `computeCompleteness` + si tiene número (join team_members).
- [ ] Step 2: cada fila de jugador aprobado muestra su % (barra pequeña o chip).
- [ ] Step 3: build OK. Commit.

---

## Task 12: Verificación e2e + cierre

- [ ] Step 1: `npm run build` y `npx vitest run` → todo verde (43 + nuevos).
- [ ] Step 2: Pedir al usuario correr migración 0008 (si no la ha corrido). Con dev local + Playwright:
  - Crear un equipo (entrenamiento) en /admin/equipos.
  - Aprobar un jugador de prueba asignándolo al equipo; copiar el magic link mostrado.
  - Abrir el magic link → cae en /jugador/perfil.
  - Completar perfil (foto, posición en cancha, número, experiencia, camiseta, etc.); verificar validación de número duplicado.
  - Ver el anillo subir a 100% en /jugador.
  - Ver el % en /admin/jugadores.
  - Limpiar datos de prueba (no tocar datos reales).
- [ ] Step 3: Revisión de código final (requesting-code-review).
- [ ] Step 4: `superpowers:finishing-a-development-branch` → merge --no-ff a main + push.

---

## Notas
- **No tocar datos reales** (galería, mensajes reales, jugadores reales confirmados).
- Patrón de formularios: `useState` + `<form action={fn}>` llamando la server action directo (evita el crash de useActionState+wrapper async documentado en el proyecto). `useActionState` directo sin wrapper SÍ es seguro.
- Migraciones DDL se corren a mano en Supabase.
- El envío de correo a jugadores requiere **verificar dominio en Resend** (prerrequisito de la spec); en local se usa el magic link copiado del panel.
