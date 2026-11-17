# EFA Voley Club — Fase 2: Sitio base público · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Construir las páginas públicas base (Inicio con impacto visual + logo, Nosotros, Contacto funcional) con SEO técnico, placeholders "Próximamente" para los módulos aún no construidos, y la identidad visual definitiva del club.

**Architecture:** Next.js App Router. Páginas en Server Components (SEO). El formulario de Contacto usa un Server Action que inserta en `contact_messages` (RLS permite insert anónimo). El texto de "Nosotros" se lee de `site_content` con un valor sembrado por migración. El logo vive en `public/brand/`.

**Tech Stack:** Next.js 15, Tailwind v4, Supabase (lectura/escritura pública con RLS), fuentes Google Anton + Inter.

---

## Sistema de diseño (concepto "Eso Fue Adentro")

**Idea central:** el nombre del club es la cantada de "balón adentro". El diseño gira en torno a la **línea de cancha** y el balón que cae justo adentro. Secciones **alternando negro dramático y crema luminoso** (no un dark-template uniforme).

**Tokens de color** (en `globals.css`, `@theme`):
```
--color-efa-ink:   #0E0E0F;  /* negro cancha, fondo oscuro */
--color-efa-bone:  #F2ECE1;  /* crema/hueso, texto sobre oscuro y fondo claro */
--color-efa-red:   #D81F26;  /* rojo remate, acento / la cantada "IN" */
--color-efa-chalk: #FFFFFF;  /* blanco tiza, las líneas de cancha */
--color-efa-ash:   #8C877E;  /* gris ceniza, texto secundario */
--color-efa-sand:  #E7DFD0;  /* crema más profundo para bordes/superficies en secciones claras */
```

**Tipografía:**
- Display: **Anton** (`--font-display`), para titulares grandes (hero, títulos de sección). Mayúsculas, tracking ligeramente negativo en tamaños grandes.
- Body: **Inter** (`--font-body`), pesos 400/500/600.

**Principios:**
- Un solo gesto audaz por pantalla (el hero). El resto, disciplinado y con aire.
- La **línea** (1–2px, tiza o roja) como dispositivo estructural, en vez de cards redondeadas genéricas.
- Mobile-first. Foco de teclado visible. `prefers-reduced-motion` respetado. Line-length < 70 car. en cuerpo.
- Evitar tells genéricos: nada de eyebrow en ALL-CAPS tracked-out sobre cada título, nada de "→" pegado a cada botón, nada de acentuar una sola palabra del titular por color salvo que sea deliberado (aquí el rojo = la línea/IN, es intencional).

---

## Task 1: Fuentes y tokens de diseño definitivos

**Files:**
- Modify: `src/app/layout.tsx` (fuentes), `src/app/globals.css` (tokens)

- [ ] **Step 1:** En `layout.tsx`, reemplazar Oswald por **Anton** manteniendo Inter:
```tsx
import { Anton, Inter } from "next/font/google";
const display = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const body = Inter({ subsets: ["latin"], variable: "--font-inter" });
```
Y en `<html lang="es" className={`${display.variable} ${body.variable}`}>`.

- [ ] **Step 2:** Reescribir `globals.css` con los tokens del sistema de diseño (los 6 colores de arriba), mapear `--font-display: var(--font-anton)` y `--font-body: var(--font-inter)`, `body` con fondo `--color-efa-ink` y texto `--color-efa-bone`, y utilidades base. Títulos `h1,h2,h3` con `font-display`, uppercase, `letter-spacing: -0.01em`.

- [ ] **Step 3:** `npm run build` compila; las clases `bg-efa-ink`, `text-efa-red`, `bg-efa-bone`, `text-efa-ink`, `border-efa-chalk` resuelven. Commit: `feat: sistema de diseño definitivo (Anton + paleta cancha)`.

---

## Task 2: Primitivas de layout (Container, Section)

**Files:**
- Create: `src/components/ui/container.tsx`, `src/components/ui/section.tsx`

- [ ] **Step 1:** `Container`: envoltorio centrado `max-w-6xl mx-auto px-4 sm:px-6`.
```tsx
export function Container({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}
```
- [ ] **Step 2:** `Section`: bloque con variante de tono (dark/light) y padding vertical consistente.
```tsx
export function Section({ tone = "dark", className = "", children }: { tone?: "dark" | "light"; className?: string; children: React.ReactNode }) {
  const tones = { dark: "bg-efa-ink text-efa-bone", light: "bg-efa-bone text-efa-ink" };
  return <section className={`${tones[tone]} py-16 sm:py-24 ${className}`}>{children}</section>;
}
```
- [ ] **Step 3:** `npx tsc --noEmit` limpio. Commit: `feat: primitivas Container y Section`.

---

## Task 3: Header con logo + navegación responsive

**Files:**
- Modify: `src/components/site-header.tsx`

- [ ] **Step 1:** Usar el logo `public/brand/efa-logo.jpg` como marca (con `next/image`), altura ~40px, junto a nav. Mantener los 6 ítems + botón "Súmate" → `/registro`. Enlace activo resaltado.
- [ ] **Step 2:** Menú móvil: botón hamburguesa que abre un panel con los enlaces (usar un Client Component con `useState`; respetar foco y `aria-expanded`). El resto del header queda Server Component.
- [ ] **Step 3:** Header `sticky top-0` con fondo `bg-efa-ink/90 backdrop-blur` y borde inferior `border-efa-chalk/10`.
- [ ] **Step 4:** `npm run build` OK. Commit: `feat: header con logo y menú móvil`.

---

## Task 4: Página de Inicio (hero "adentro" + secciones)

**Files:**
- Modify: `src/app/page.tsx`
- Create (si ayuda): `src/components/home/hero.tsx`, `src/components/home/line-mark.tsx`

- [ ] **Step 1 — Hero:** full-bleed oscuro. Composición:
  - El **logo** del club (next/image) a tamaño medio.
  - Titular en Anton grande: `ESO FUE ADENTRO` (si se usa el logo que ya trae el texto, el titular puede ser la **frase/tagline** para no duplicar — ver copy abajo).
  - **Motivo de línea:** una línea de tiza (`bg-efa-chalk`, 2px) cruzando en diagonal o horizontal, con un **punto rojo** (el balón) posado *justo adentro* de la línea. SVG inline, decorativo (`aria-hidden`).
  - Tagline (copy): *"El club donde cada punto se juega al límite. Vóley formativo y competitivo."* (ajustable).
  - CTA primario: **Súmate al club** → `/registro`. CTA secundario (texto-enlace): **Conócenos** → `/nosotros`.
  - Alineación a la izquierda, no centrada.
- [ ] **Step 2 — Sección "Quiénes somos" (tono light/crema):** 2–3 frases institucionales + enlace a `/nosotros`. Usa la línea roja como divisor, no cards.
- [ ] **Step 3 — Sección "La cancha / lo que hacemos" (tono dark):** 3 pilares del club (ej. Formación, Competencia, Comunidad) en una grilla simple y sobria (sin sombras genéricas; separadores de línea). Copy real y claro.
- [ ] **Step 4 — Franja CTA final (tono red o dark con acento):** "¿Listo para entrar a la cancha?" + botón Súmate.
- [ ] **Step 5:** Respetar `prefers-reduced-motion`. Una sola animación orquestada como mucho (ej. el punto rojo "cae" al cargar; desactivada si reduced-motion).
- [ ] **Step 6:** `npm run build` OK; revisar responsive a 375px. Commit: `feat: página de inicio con hero y secciones`.

---

## Task 5: Footer definitivo

**Files:**
- Modify: `src/components/site-footer.tsx`

- [ ] **Step 1:** Tres zonas: marca (logo pequeño + nombre), navegación resumida, y contacto (email del club + nota "Redes sociales: próximamente"). Línea superior de tiza tenue.
- [ ] **Step 2:** Año dinámico. `npm run build` OK. Commit: `feat: footer definitivo`.

---

## Task 6: Página Nosotros (lee site_content)

**Files:**
- Create: `src/app/nosotros/page.tsx`, `supabase/migrations/0003_seed_site_content.sql`
- Create: `src/lib/site-content.ts`

- [ ] **Step 1 — Migración semilla** `0003_seed_site_content.sql`:
```sql
insert into site_content (key, value) values
  ('nosotros_titulo', 'Sobre EFA Voley Club'),
  ('nosotros_cuerpo', 'Eso Fue Adentro nace de la pasión por el vóley y la convicción de que cada punto se juega al límite. Formamos jugadoras y jugadores dentro y fuera de la cancha, con disciplina, comunidad y juego competitivo.')
on conflict (key) do nothing;
```
(Manual: ejecutar en el SQL Editor de Supabase. Dejar versionado.)

- [ ] **Step 2 — Helper `src/lib/site-content.ts`:** función `getSiteContent(keys: string[])` que consulta Supabase (cliente server) y devuelve un `Record<string,string>`, con *fallbacks* por si la fila no existe (para que la página nunca quede vacía).
```ts
import { createClient } from "@/lib/supabase/server";

const FALLBACKS: Record<string, string> = {
  nosotros_titulo: "Sobre EFA Voley Club",
  nosotros_cuerpo: "Eso Fue Adentro nace de la pasión por el vóley. Formamos dentro y fuera de la cancha.",
};

export async function getSiteContent(keys: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = FALLBACKS[k] ?? "";
  try {
    const sb = await createClient();
    const { data } = await sb.from("site_content").select("key,value").in("key", keys);
    for (const row of data ?? []) if (row.value) out[row.key] = row.value;
  } catch {
    // Si Supabase no responde, se usan los fallbacks.
  }
  return out;
}
```
- [ ] **Step 3 — Página `/nosotros`:** Server Component que llama `getSiteContent(["nosotros_titulo","nosotros_cuerpo"])` y renderiza institucional (tono light), con sección de categorías/valores. `export const metadata` propio.
- [ ] **Step 4:** `npm run build` OK. Commit: `feat: página Nosotros con contenido editable`.

---

## Task 7: Página Contacto (formulario funcional)

**Files:**
- Create: `src/app/contacto/page.tsx`, `src/app/contacto/actions.ts`, `src/components/contact-form.tsx`
- Test: `src/lib/__tests__/contact-validation.test.ts`, `src/lib/contact-validation.ts`

- [ ] **Step 1 — Validación (TDD):** test primero en `contact-validation.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { validateContact } from "@/lib/contact-validation";

describe("validateContact", () => {
  it("acepta datos válidos", () => {
    expect(validateContact({ nombre: "Ana", email: "a@b.com", mensaje: "Hola equipo" }).ok).toBe(true);
  });
  it("rechaza email inválido", () => {
    expect(validateContact({ nombre: "Ana", email: "noemail", mensaje: "Hola equipo" }).ok).toBe(false);
  });
  it("rechaza mensaje corto", () => {
    expect(validateContact({ nombre: "Ana", email: "a@b.com", mensaje: "hi" }).ok).toBe(false);
  });
  it("rechaza nombre vacío", () => {
    expect(validateContact({ nombre: "", email: "a@b.com", mensaje: "Hola equipo" }).ok).toBe(false);
  });
});
```
- [ ] **Step 2:** Verificar que falla. Implementar `src/lib/contact-validation.ts` con Zod (nombre min 2, email válido, mensaje min 5), devolviendo `{ ok: boolean, errors?: Record<string,string> }`.
- [ ] **Step 3:** Verificar que pasa (`npx vitest run`).
- [ ] **Step 4 — Server Action** `actions.ts`: `"use server"`, recibe FormData, valida con `validateContact`, inserta en `contact_messages` vía cliente server de Supabase, devuelve estado de éxito/error. (El aviso por correo con Resend se añade en una fase posterior; dejar un `// TODO Resend` comentado.)
- [ ] **Step 5 — UI** `contact-form.tsx` (Client Component con `useActionState`): campos nombre/email/mensaje, estados de éxito ("¡Gracias! Te responderemos pronto.") y error en la voz de la interfaz (sin disculpas genéricas). Datos de contacto del club al lado (email, "redes: próximamente").
- [ ] **Step 6 — Página `/contacto`** con metadata propia, que monta el form. `npm run build` OK y `npm test` verde. Commit: `feat: página de contacto con formulario funcional`.

---

## Task 8: Placeholders "Próximamente"

**Files:**
- Create: `src/app/noticias/page.tsx`, `src/app/convocatorias/page.tsx`, `src/app/galeria/page.tsx`, `src/app/registro/page.tsx`
- Create: `src/components/coming-soon.tsx`

- [ ] **Step 1:** Componente `ComingSoon` reutilizable: título de la sección + mensaje breve ("Estamos preparando esta sección. Muy pronto."), con la estética del club (no un 404). Prop `titulo` y `descripcion`.
- [ ] **Step 2:** Las 4 páginas lo usan con su copy, cada una con `metadata` propia. (El `/registro` real y los módulos se construyen en sus fases; esto evita los 404.)
- [ ] **Step 3:** `npm run build` OK (las 4 rutas existen → sin 404). Commit: `feat: placeholders Próximamente para módulos futuros`.

---

## Task 9: SEO técnico (sitemap, robots, JSON-LD, metadata)

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`
- Modify: `src/app/layout.tsx` (JSON-LD + metadataBase)

- [ ] **Step 1 — `metadataBase`:** en `layout.tsx` metadata, añadir `metadataBase: new URL("https://efavoleyclub.com")` y OpenGraph con imagen del logo (`/brand/efa-logo.jpg`).
- [ ] **Step 2 — `robots.ts`:**
```ts
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin"] }, sitemap: "https://efavoleyclub.com/sitemap.xml" };
}
```
- [ ] **Step 3 — `sitemap.ts`:** lista de rutas públicas estáticas (`/`, `/nosotros`, `/contacto`, `/noticias`, `/convocatorias`, `/galeria`, `/registro`) con `lastModified`. (Cuando existan noticias/convocatorias dinámicas, se añaden en sus fases.)
- [ ] **Step 4 — JSON-LD `Organization`:** en `layout.tsx`, un `<script type="application/ld+json">` con nombre, logo (URL absoluta), y `sameAs: []` (redes vacías por ahora).
- [ ] **Step 5:** `npm run build` OK; verificar que `/sitemap.xml` y `/robots.txt` se generan. Commit: `feat: SEO técnico (sitemap, robots, JSON-LD)`.

---

## Task 10: Verificación final de la fase

- [ ] **Step 1:** `npm test` (todo verde) y `npm run build` (compila).
- [ ] **Step 2:** Revisar responsive a 375px en Inicio, Nosotros, Contacto.
- [ ] **Step 3:** Confirmar que ningún ítem del menú da 404.
- [ ] **Step 4:** Commit final si quedaran ajustes. Merge a `main` y push (deploy automático en Vercel).

---

## Self-review (cobertura vs. objetivo Fase 2)

- Identidad visual definitiva + logo → Tasks 1,3,4,5 ✅
- Inicio con impacto → Task 4 ✅
- Nosotros (editable) → Task 6 ✅
- Contacto funcional (guarda en BD) → Task 7 ✅ (Resend → fase posterior, TODO marcado)
- Sin 404 en el menú → Task 8 ✅
- SEO técnico → Task 9 ✅

## Pendientes manuales

1. Ejecutar `0003_seed_site_content.sql` en el SQL Editor de Supabase (para el texto de Nosotros).
2. (Opcional) Subir una imagen Open Graph dedicada más adelante; por ahora se usa el logo.
