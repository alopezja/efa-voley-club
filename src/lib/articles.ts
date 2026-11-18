import { createClient } from "@/lib/supabase/server";

export type ArticleEstado = "borrador" | "publicado";

export type Article = {
  id: string;
  titulo: string;
  slug: string;
  resumen: string | null;
  cuerpo: string | null;
  imagen_portada_url: string | null;
  autor: string | null;
  estado: ArticleEstado;
  fecha_publicacion: string | null;
  created_at: string;
  updated_at: string;
};

const COLS =
  "id,titulo,slug,resumen,cuerpo,imagen_portada_url,autor,estado,fecha_publicacion,created_at,updated_at";

// Públicas (RLS permite ver solo 'publicado' a usuarios anónimos).
export async function getPublishedArticles(limit?: number): Promise<Article[]> {
  try {
    const sb = await createClient();
    let q = sb
      .from("articles")
      .select(COLS)
      .eq("estado", "publicado")
      .order("fecha_publicacion", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (limit) q = q.limit(limit);
    const { data } = await q;
    return (data as Article[]) ?? [];
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const sb = await createClient();
    const { data } = await sb.from("articles").select(COLS).eq("slug", slug).maybeSingle();
    return (data as Article) ?? null;
  } catch {
    return null;
  }
}

// Todas (para el panel; RLS exige admin).
export async function getAllArticles(): Promise<Article[]> {
  try {
    const sb = await createClient();
    const { data } = await sb.from("articles").select(COLS).order("created_at", { ascending: false });
    return (data as Article[]) ?? [];
  } catch {
    return [];
  }
}

export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const sb = await createClient();
    const { data } = await sb.from("articles").select(COLS).eq("id", id).maybeSingle();
    return (data as Article) ?? null;
  } catch {
    return null;
  }
}
