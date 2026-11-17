# Fase 4 — Galería (fotos a R2 + videos de YouTube) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Galería pública (`/galeria`) con fotos y videos, y un módulo admin (`/admin/galeria`) con el patrón "subir → describir → guardar".

**Architecture:** Las fotos se suben a R2 **a través del servidor** (server action admin con `uploadToR2`, sin CORS), optimizadas en el navegador antes de subir (canvas, ≤1600px, JPEG) para quedar bajo el límite de 4.5 MB de Vercel. Los videos se agregan pegando un enlace de YouTube (se guarda `enlace_youtube`, se derivan embed y miniatura). La tabla `gallery_items` y las RLS (lectura pública / escritura `is_admin()`) ya existen; no hay migraciones nuevas.

**Tech Stack:** Next.js 15 (App Router, server actions), React 19, Supabase (`@supabase/ssr`), `@aws-sdk/client-s3`, Tailwind v4, Vitest.

**Decisiones:** Fotos→R2 vía servidor + compresión cliente. Videos→solo YouTube (R2-video queda para después). Público con filtro por categoría (si hay ≥2) y lightbox. Fuera de alcance: destacados de galería en la home. Imágenes servidas con `<img loading="lazy">` (sin `next/image` remoto → sin tocar `next.config`).

---

### Task 1: Helpers de R2 (subir, borrar, derivar key)

**Files:**
- Modify: `src/lib/r2.ts`
- Test: `src/lib/__tests__/r2.test.ts`

- [ ] **Step 1: Test de `keyFromPublicUrl` (falla)**

Añadir a `src/lib/__tests__/r2.test.ts`:

```ts
import { buildObjectKey, publicUrlForKey, keyFromPublicUrl } from "@/lib/r2";

describe("keyFromPublicUrl", () => {
  it("extrae la key cuando la URL pertenece a la base", () => {
    expect(keyFromPublicUrl("https://cdn.efa.com/galeria/1-foto.jpg", "https://cdn.efa.com")).toBe("galeria/1-foto.jpg");
  });
  it("tolera base con barra final", () => {
    expect(keyFromPublicUrl("https://cdn.efa.com/galeria/1-foto.jpg", "https://cdn.efa.com/")).toBe("galeria/1-foto.jpg");
  });
  it("devuelve null si la URL no pertenece a la base", () => {
    expect(keyFromPublicUrl("https://otro.com/x.jpg", "https://cdn.efa.com")).toBeNull();
  });
});
```

- [ ] **Step 2: Correr test → FALLA** (`keyFromPublicUrl` no existe)

Run: `npm run test -- r2`
Expected: FAIL (import error / not a function)

- [ ] **Step 3: Implementar en `src/lib/r2.ts`**

Cambiar el import de la línea 1 a incluir `DeleteObjectCommand`:

```ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
```

Añadir al final del archivo:

```ts
export function keyFromPublicUrl(url: string, base: string): string | null {
  const prefix = base.replace(/\/$/, "") + "/";
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

export async function uploadToR2(
  folder: string,
  filename: string,
  contentType: string,
  body: Uint8Array
) {
  const env = serverEnv();
  const key = buildObjectKey(folder, filename);
  await r2Client().send(
    new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, ContentType: contentType, Body: body })
  );
  return { key, publicUrl: publicUrlForKey(key, env.R2_PUBLIC_BASE_URL) };
}

export async function deleteFromR2(key: string) {
  const env = serverEnv();
  await r2Client().send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
}
```

- [ ] **Step 4: Correr test → PASA**

Run: `npm run test -- r2`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/r2.ts src/lib/__tests__/r2.test.ts
git commit -m "feat(galeria): helpers R2 subir/borrar y keyFromPublicUrl"
```

---

### Task 2: Validación y helpers de YouTube

**Files:**
- Create: `src/lib/gallery-validation.ts`
- Test: `src/lib/__tests__/gallery-validation.test.ts`

- [ ] **Step 1: Test (falla)**

```ts
import { describe, it, expect } from "vitest";
import { youtubeId, youtubeEmbedUrl, youtubeThumb, validateYoutube, validatePhotoMeta } from "@/lib/gallery-validation";

describe("youtubeId", () => {
  it("extrae id de watch?v=", () => expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ"));
  it("extrae id de youtu.be", () => expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ"));
  it("extrae id de /shorts/", () => expect(youtubeId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ"));
  it("extrae id de /embed/", () => expect(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ"));
  it("devuelve null si no es youtube", () => expect(youtubeId("https://vimeo.com/123")).toBeNull());
});

describe("validateYoutube", () => {
  it("ok con url válida y devuelve id", () => {
    const r = validateYoutube({ enlace: "https://youtu.be/dQw4w9WgXcQ", titulo: "Partido" });
    expect(r.ok && r.id).toBe("dQw4w9WgXcQ");
  });
  it("error si el enlace no es youtube", () => {
    const r = validateYoutube({ enlace: "no-url", titulo: "" });
    expect(r.ok).toBe(false);
  });
});

describe("validatePhotoMeta", () => {
  it("rechaza tipo no permitido", () => {
    expect(validatePhotoMeta({ contentType: "application/pdf", size: 100 }).ok).toBe(false);
  });
  it("rechaza tamaño excesivo", () => {
    expect(validatePhotoMeta({ contentType: "image/jpeg", size: 50 * 1024 * 1024 }).ok).toBe(false);
  });
  it("acepta jpeg pequeño", () => {
    expect(validatePhotoMeta({ contentType: "image/jpeg", size: 200 * 1024 }).ok).toBe(true);
  });
});
```

- [ ] **Step 2: Correr test → FALLA**

Run: `npm run test -- gallery-validation`
Expected: FAIL

- [ ] **Step 3: Implementar `src/lib/gallery-validation.ts`**

```ts
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB (bajo el límite de Vercel)

export function youtubeId(input: string): string | null {
  if (!input) return null;
  const s = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*\bv=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/(?:embed|shorts)\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function validateYoutube(v: { enlace: string; titulo?: string }):
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string> } {
  const id = youtubeId(v.enlace ?? "");
  if (!id) return { ok: false, errors: { enlace: "Pega un enlace válido de YouTube." } };
  return { ok: true, id };
}

export function validatePhotoMeta(v: { contentType: string; size: number }):
  | { ok: true }
  | { ok: false; errors: Record<string, string> } {
  if (!ALLOWED_IMAGE_TYPES.includes(v.contentType))
    return { ok: false, errors: { archivo: "Formato no permitido. Usa JPG, PNG o WebP." } };
  if (v.size > MAX_IMAGE_BYTES)
    return { ok: false, errors: { archivo: "La imagen es muy pesada (máx. 4 MB)." } };
  return { ok: true };
}
```

- [ ] **Step 4: Correr test → PASA**

Run: `npm run test -- gallery-validation`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/gallery-validation.ts src/lib/__tests__/gallery-validation.test.ts
git commit -m "feat(galeria): validación de fotos y helpers de YouTube"
```

---

### Task 3: Lectura de items de galería

**Files:**
- Create: `src/lib/gallery.ts`

- [ ] **Step 1: Implementar `src/lib/gallery.ts`**

```ts
import { createClient } from "@/lib/supabase/server";

export type GalleryItem = {
  id: string;
  tipo: "foto" | "video";
  titulo: string | null;
  descripcion: string | null;
  url: string | null;
  enlace_youtube: string | null;
  categoria: string | null;
  orden: number;
  created_at: string;
};

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("gallery_items")
      .select("id,tipo,titulo,descripcion,url,enlace_youtube,categoria,orden,created_at")
      .order("orden", { ascending: true })
      .order("created_at", { ascending: false });
    return (data as GalleryItem[]) ?? [];
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: Verificar compilación de tipos**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos

- [ ] **Step 3: Commit**

```bash
git add src/lib/gallery.ts
git commit -m "feat(galeria): lectura de items (getGalleryItems)"
```

---

### Task 4: Server actions del admin (subir foto / agregar video / borrar)

**Files:**
- Create: `src/app/admin/(panel)/galeria/actions.ts`

- [ ] **Step 1: Implementar las acciones**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2, deleteFromR2, keyFromPublicUrl } from "@/lib/r2";
import { serverEnv } from "@/lib/env";
import { validatePhotoMeta, validateYoutube } from "@/lib/gallery-validation";

export type GalleryActionState = { status: "idle" | "success" | "error"; message?: string };

function revalidateGaleria() {
  revalidatePath("/galeria");
  revalidatePath("/admin/galeria");
}

export async function uploadPhoto(_prev: GalleryActionState, formData: FormData): Promise<GalleryActionState> {
  await requireAdmin();
  const file = formData.get("archivo");
  if (!(file instanceof File) || file.size === 0)
    return { status: "error", message: "Elige una imagen." };

  const check = validatePhotoMeta({ contentType: file.type, size: file.size });
  if (!check.ok) return { status: "error", message: Object.values(check.errors)[0] };

  const buffer = new Uint8Array(await file.arrayBuffer());
  let publicUrl: string;
  try {
    const res = await uploadToR2("galeria", file.name, file.type, buffer);
    publicUrl = res.publicUrl;
  } catch {
    return { status: "error", message: "No pudimos subir la imagen. Intenta de nuevo." };
  }

  const sb = await createClient();
  const { error } = await sb.from("gallery_items").insert({
    tipo: "foto",
    url: publicUrl,
    titulo: (formData.get("titulo") as string)?.trim() || null,
    descripcion: (formData.get("descripcion") as string)?.trim() || null,
    categoria: (formData.get("categoria") as string)?.trim() || null,
  });
  if (error) return { status: "error", message: "Se subió la imagen pero no se guardó. Intenta de nuevo." };

  revalidateGaleria();
  return { status: "success", message: "Foto agregada." };
}

export async function addYoutubeVideo(_prev: GalleryActionState, formData: FormData): Promise<GalleryActionState> {
  await requireAdmin();
  const enlace = (formData.get("enlace") as string) ?? "";
  const check = validateYoutube({ enlace });
  if (!check.ok) return { status: "error", message: Object.values(check.errors)[0] };

  const sb = await createClient();
  const { error } = await sb.from("gallery_items").insert({
    tipo: "video",
    enlace_youtube: `https://youtu.be/${check.id}`,
    titulo: (formData.get("titulo") as string)?.trim() || null,
    descripcion: (formData.get("descripcion") as string)?.trim() || null,
    categoria: (formData.get("categoria") as string)?.trim() || null,
  });
  if (error) return { status: "error", message: "No se pudo guardar el video. Intenta de nuevo." };

  revalidateGaleria();
  return { status: "success", message: "Video agregado." };
}

export async function deleteGalleryItem(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const sb = await createClient();
  const { data: row } = await sb.from("gallery_items").select("url").eq("id", id).maybeSingle();
  if (row?.url) {
    const key = keyFromPublicUrl(row.url, serverEnv().R2_PUBLIC_BASE_URL);
    if (key) {
      try {
        await deleteFromR2(key);
      } catch {
        /* best-effort: si falla el borrado en R2 igual quitamos la fila */
      }
    }
  }
  await sb.from("gallery_items").delete().eq("id", id);
  revalidateGaleria();
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos

- [ ] **Step 3: Commit**

```bash
git add "src/app/admin/(panel)/galeria/actions.ts"
git commit -m "feat(galeria): server actions admin (subir/video/borrar)"
```

---

### Task 5: Compresión de imagen (cliente) + componente admin

**Files:**
- Create: `src/lib/compress-image.ts`
- Create: `src/components/admin/gallery-manager.tsx`

- [ ] **Step 1: Util de compresión `src/lib/compress-image.ts`**

```ts
// Redimensiona en el navegador a ≤maxDim px y exporta JPEG para bajar peso.
// Si algo falla, devuelve el archivo original.
export async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
```

- [ ] **Step 2: Componente `src/components/admin/gallery-manager.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { compressImage } from "@/lib/compress-image";
import {
  uploadPhoto,
  addYoutubeVideo,
  deleteGalleryItem,
  type GalleryActionState,
} from "@/app/admin/(panel)/galeria/actions";
import type { GalleryItem } from "@/lib/gallery";
import { youtubeId, youtubeThumb } from "@/lib/gallery-validation";

const input =
  "w-full rounded-md border border-efa-ash/40 bg-efa-ink px-4 py-3 text-base text-efa-bone placeholder:text-efa-ash focus:border-efa-red focus:outline-none";

function SubmitBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-efa-red px-5 py-3 text-base font-semibold text-efa-chalk transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}

export function GalleryManager({ items }: { items: GalleryItem[] }) {
  const [tab, setTab] = useState<"foto" | "video">("foto");
  const [msg, setMsg] = useState<GalleryActionState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPhoto(formData: FormData) {
    const f = fileRef.current?.files?.[0];
    if (f) formData.set("archivo", await compressImage(f));
    setMsg(await uploadPhoto({ status: "idle" }, formData));
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onVideo(formData: FormData) {
    setMsg(await addYoutubeVideo({ status: "idle" }, formData));
  }

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-5 flex gap-2">
          {(["foto", "video"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setMsg(null); }}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${tab === t ? "bg-efa-red text-efa-chalk" : "border border-efa-ash/40 text-efa-ash"}`}
            >
              {t === "foto" ? "Foto" : "Video (YouTube)"}
            </button>
          ))}
        </div>

        {msg?.message && (
          <p role="status" className={`mb-4 text-sm font-medium ${msg.status === "error" ? "text-efa-red" : "text-green-400"}`}>
            {msg.message}
          </p>
        )}

        {tab === "foto" ? (
          <form action={onPhoto} className="grid max-w-xl gap-4">
            <input ref={fileRef} name="archivo" type="file" accept="image/jpeg,image/png,image/webp" required className={input} />
            <input name="titulo" placeholder="Título (opcional)" className={input} />
            <input name="categoria" placeholder="Categoría (opcional)" className={input} />
            <textarea name="descripcion" rows={2} placeholder="Descripción (opcional)" className={input} />
            <div><SubmitBtn>Subir foto</SubmitBtn></div>
          </form>
        ) : (
          <form action={onVideo} className="grid max-w-xl gap-4">
            <input name="enlace" placeholder="Enlace de YouTube" required className={input} />
            <input name="titulo" placeholder="Título (opcional)" className={input} />
            <input name="categoria" placeholder="Categoría (opcional)" className={input} />
            <textarea name="descripcion" rows={2} placeholder="Descripción (opcional)" className={input} />
            <div><SubmitBtn>Agregar video</SubmitBtn></div>
          </form>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-2xl text-efa-bone">En la galería ({items.length})</h2>
        {items.length === 0 ? (
          <p className="text-efa-ash">Aún no hay nada. Sube la primera foto o agrega un video.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((it) => {
              const thumb = it.tipo === "foto" ? it.url : (it.enlace_youtube ? youtubeThumb(youtubeId(it.enlace_youtube) ?? "") : null);
              return (
                <div key={it.id} className="overflow-hidden rounded-lg border border-efa-ash/30 bg-efa-ink">
                  <div className="aspect-square bg-black/40">
                    {thumb && <img src={thumb} alt={it.titulo ?? ""} loading="lazy" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2">
                    <span className="truncate text-xs text-efa-ash">{it.titulo ?? (it.tipo === "video" ? "Video" : "Foto")}</span>
                    <form action={deleteGalleryItem}>
                      <input type="hidden" name="id" value={it.id} />
                      <button type="submit" className="text-xs font-semibold text-efa-red hover:underline">Borrar</button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos

- [ ] **Step 4: Commit**

```bash
git add src/lib/compress-image.ts src/components/admin/gallery-manager.tsx
git commit -m "feat(galeria): uploader admin con compresión en el navegador"
```

---

### Task 6: Página admin `/admin/galeria` + enlace en el nav

**Files:**
- Create: `src/app/admin/(panel)/galeria/page.tsx`
- Modify: `src/components/admin/admin-nav.tsx`

- [ ] **Step 1: Página `src/app/admin/(panel)/galeria/page.tsx`**

```tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getGalleryItems } from "@/lib/gallery";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Galería", robots: { index: false, follow: false } };

export default async function AdminGaleriaPage() {
  await requireAdmin();
  const items = await getGalleryItems();
  return (
    <div>
      <h1 className="mb-8 text-4xl">Galería</h1>
      <GalleryManager items={items} />
    </div>
  );
}
```

- [ ] **Step 2: Enlace activo en `src/components/admin/admin-nav.tsx`**

Reemplazar el array `upcoming` y el bloque que lo renderiza para que "Galería" sea un enlace real:

```tsx
const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/galeria", label: "Galería" },
];
const upcoming = ["Noticias", "Convocatorias", "Jugadores", "Mensajes"];
```

Y en el JSX, renderizar primero los `links` (como `<Link>`), dejando el estilo rojo solo para `/admin`:

```tsx
{links.map((l) => (
  <Link
    key={l.href}
    href={l.href}
    className={`block rounded-md px-4 py-3 text-base font-semibold ${l.href === "/admin" ? "bg-efa-red text-efa-chalk" : "text-efa-bone hover:text-efa-red"}`}
  >
    {l.label}
  </Link>
))}
{upcoming.map((label) => ( /* ...igual que antes... */ ))}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: compila; aparece la ruta `/admin/galeria`

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(panel)/galeria/page.tsx" src/components/admin/admin-nav.tsx
git commit -m "feat(galeria): página admin y enlace en el panel"
```

---

### Task 7: Galería pública (`/galeria`) con filtro y lightbox

**Files:**
- Create: `src/components/gallery-grid.tsx`
- Modify: `src/app/(site)/galeria/page.tsx`

- [ ] **Step 1: Componente `src/components/gallery-grid.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import type { GalleryItem } from "@/lib/gallery";
import { youtubeId, youtubeEmbedUrl, youtubeThumb } from "@/lib/gallery-validation";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const categorias = useMemo(
    () => Array.from(new Set(items.map((i) => i.categoria).filter(Boolean))) as string[],
    [items]
  );
  const [filtro, setFiltro] = useState<string | null>(null);
  const [activo, setActivo] = useState<GalleryItem | null>(null);

  const visibles = filtro ? items.filter((i) => i.categoria === filtro) : items;

  return (
    <div>
      {categorias.length >= 2 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button onClick={() => setFiltro(null)} className={chip(filtro === null)}>Todo</button>
          {categorias.map((c) => (
            <button key={c} onClick={() => setFiltro(c)} className={chip(filtro === c)}>{c}</button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibles.map((it) => {
          const yt = it.enlace_youtube ? youtubeId(it.enlace_youtube) : null;
          const thumb = it.tipo === "foto" ? it.url : (yt ? youtubeThumb(yt) : null);
          return (
            <button
              key={it.id}
              onClick={() => setActivo(it)}
              className="group relative aspect-square overflow-hidden rounded-lg bg-efa-ink/80"
            >
              {thumb && (
                <img src={thumb} alt={it.titulo ?? ""} loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105" />
              )}
              {it.tipo === "video" && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-efa-red/90 text-efa-chalk">▶</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activo && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActivo(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <div className="max-h-[90vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {activo.tipo === "foto" ? (
              <img src={activo.url ?? ""} alt={activo.titulo ?? ""} className="mx-auto max-h-[80vh] w-auto rounded-lg" />
            ) : (
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full rounded-lg"
                  src={youtubeEmbedUrl(youtubeId(activo.enlace_youtube ?? "") ?? "")}
                  title={activo.titulo ?? "Video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {(activo.titulo || activo.descripcion) && (
              <div className="mt-3 text-center text-efa-bone">
                {activo.titulo && <p className="font-display text-xl">{activo.titulo}</p>}
                {activo.descripcion && <p className="mt-1 text-sm text-efa-ash">{activo.descripcion}</p>}
              </div>
            )}
            <button onClick={() => setActivo(null)} className="mx-auto mt-4 block text-sm font-semibold text-efa-ash hover:text-efa-chalk">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function chip(active: boolean): string {
  return `rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-efa-red text-efa-chalk" : "border border-efa-ink/20 text-efa-ink hover:border-efa-red"}`;
}
```

- [ ] **Step 2: Página `src/app/(site)/galeria/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getGalleryItems } from "@/lib/gallery";
import { GalleryGrid } from "@/components/gallery-grid";

export const metadata: Metadata = {
  title: "Galería",
  description: "Fotos y videos de Eso Fue Adentro Voley Club: entrenamientos, partidos y momentos del club.",
};

export default async function GaleriaPage() {
  const items = await getGalleryItems();
  return (
    <Section tone="light">
      <Container>
        <div className="max-w-2xl border-l-2 border-efa-red pl-6">
          <h1 className="text-4xl text-efa-ink sm:text-6xl">Galería</h1>
          <p className="mt-5 text-lg text-efa-ink/70">Momentos del club dentro y fuera de la cancha.</p>
        </div>
        <div className="mt-12">
          {items.length === 0 ? (
            <p className="text-efa-ink/60">Pronto subiremos fotos y videos. ¡Vuelve en unos días!</p>
          ) : (
            <GalleryGrid items={items} />
          )}
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: compila; `/galeria` sigue como ruta dinámica/estática sin error

- [ ] **Step 4: Commit**

```bash
git add src/components/gallery-grid.tsx "src/app/(site)/galeria/page.tsx"
git commit -m "feat(galeria): página pública con filtro y lightbox"
```

---

### Task 8: Verificación de punta a punta

- [ ] **Step 1: Suite de tests**

Run: `npm run test`
Expected: PASS (incluye los nuevos de r2 y gallery-validation)

- [ ] **Step 2: Build limpio**

Run: `npm run build`
Expected: PASS, con rutas `/galeria` y `/admin/galeria`

- [ ] **Step 3: Prueba manual (Playwright, dev server)**

1. Login en `/admin/login` → ir a `/admin/galeria`.
2. Subir una foto (JPG) con título y categoría → aparece en "En la galería".
3. Agregar un video de YouTube → aparece con miniatura y ▶.
4. Abrir `/galeria` (público) → se ve la grilla; clic en foto abre lightbox; clic en video abre el embed; filtro por categoría si hay ≥2.
5. Volver al admin y **Borrar** un item → desaparece de ambas vistas.

- [ ] **Step 4: Commit final si hubo ajustes y preparar merge**

```bash
git add -A && git commit -m "test(galeria): verificación e2e y ajustes"
```

---

## Notas de verificación (self-review)

- **Cobertura del spec:** `/galeria` fotos(R2)+videos(YouTube) ✔; admin "subir/describir/guardar" ✔; RLS ya existentes ✔. (R2-video y destacados en home = fuera de alcance declarado).
- **Límite de Vercel:** compresión cliente + `MAX_IMAGE_BYTES` 4 MB mantienen la subida server-proxied por debajo de 4.5 MB.
- **Consistencia de tipos:** `GalleryItem` se usa igual en `gallery.ts`, el manager y el grid; `youtubeId/youtubeEmbedUrl/youtubeThumb` definidos en Task 2 y usados en Tasks 5 y 7.
- **Borrado:** best-effort en R2 (try/catch) + borrado de fila siempre.
