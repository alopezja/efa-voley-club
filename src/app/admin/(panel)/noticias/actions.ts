"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2, deleteFromR2, keyFromPublicUrl } from "@/lib/r2";
import { serverEnv } from "@/lib/env";
import { slugify } from "@/lib/slug";
import { validateArticle } from "@/lib/article-validation";
import { validatePhotoMeta } from "@/lib/gallery-validation";

export type ArticleState = {
  status: "idle" | "error";
  errors?: Record<string, string>;
  message?: string;
};

type SB = Awaited<ReturnType<typeof createClient>>;

async function uniqueSlug(sb: SB, titulo: string, excludeId: string | null) {
  const base = slugify(titulo) || "noticia";
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await sb.from("articles").select("id").eq("slug", slug).maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

function revalidar(slug?: string) {
  revalidatePath("/noticias");
  revalidatePath("/admin/noticias");
  revalidatePath("/");
  if (slug) revalidatePath(`/noticias/${slug}`);
}

export async function saveArticle(_prev: ArticleState, formData: FormData): Promise<ArticleState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;

  const check = validateArticle({
    titulo: String(formData.get("titulo") ?? ""),
    resumen: String(formData.get("resumen") ?? ""),
    cuerpo: String(formData.get("cuerpo") ?? ""),
    autor: String(formData.get("autor") ?? ""),
    estado: String(formData.get("estado") ?? "borrador"),
  });
  if (!check.ok) return { status: "error", errors: check.errors };
  const v = check.values;

  const sb = await createClient();

  // Imagen de portada: nueva (archivo) o la actual
  let imagen_portada_url = String(formData.get("imagen_actual") ?? "") || null;
  const file = formData.get("imagen");
  if (file instanceof File && file.size > 0) {
    const meta = validatePhotoMeta({ contentType: file.type, size: file.size });
    if (!meta.ok) return { status: "error", errors: { imagen: Object.values(meta.errors)[0] } };
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const res = await uploadToR2("noticias", file.name, file.type, buffer);
      imagen_portada_url = res.publicUrl;
    } catch {
      return { status: "error", message: "No pudimos subir la imagen. Intenta de nuevo." };
    }
  }

  const slug = await uniqueSlug(sb, v.titulo, id);

  const row: Record<string, unknown> = {
    titulo: v.titulo,
    slug,
    resumen: v.resumen || null,
    cuerpo: v.cuerpo || null,
    autor: v.autor || null,
    imagen_portada_url,
    estado: v.estado,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    // Si se publica y no tenía fecha, fijarla ahora
    if (v.estado === "publicado") {
      const { data: prev } = await sb.from("articles").select("fecha_publicacion").eq("id", id).maybeSingle();
      if (prev && !prev.fecha_publicacion) row.fecha_publicacion = new Date().toISOString();
    }
    const { error } = await sb.from("articles").update(row).eq("id", id);
    if (error) return { status: "error", message: "No se pudo guardar. Intenta de nuevo." };
  } else {
    if (v.estado === "publicado") row.fecha_publicacion = new Date().toISOString();
    const { error } = await sb.from("articles").insert(row);
    if (error) return { status: "error", message: "No se pudo crear la noticia. Intenta de nuevo." };
  }

  revalidar(slug);
  redirect("/admin/noticias");
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = await createClient();
  const { data: row } = await sb.from("articles").select("imagen_portada_url").eq("id", id).maybeSingle();
  if (row?.imagen_portada_url) {
    const key = keyFromPublicUrl(row.imagen_portada_url, serverEnv().R2_PUBLIC_BASE_URL);
    if (key) {
      try {
        await deleteFromR2(key);
      } catch {
        /* best-effort */
      }
    }
  }
  await sb.from("articles").delete().eq("id", id);
  revalidar();
}
