import { createClient } from "@/lib/supabase/server";

export type ConvocatoriaEstado = "borrador" | "publicado";

export type Convocatoria = {
  id: string;
  titulo: string;
  slug: string;
  fecha_torneo: string | null;
  lugar: string | null;
  categoria: string | null;
  descripcion: string | null;
  imagen_portada_url: string | null;
  estado: ConvocatoriaEstado;
  created_at: string;
  updated_at: string;
};

const COLS =
  "id,titulo,slug,fecha_torneo,lugar,categoria,descripcion,imagen_portada_url,estado,created_at,updated_at";

export async function getPublishedConvocatorias(limit?: number): Promise<Convocatoria[]> {
  try {
    const sb = await createClient();
    let q = sb
      .from("convocatorias")
      .select(COLS)
      .eq("estado", "publicado")
      .order("fecha_torneo", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (limit) q = q.limit(limit);
    const { data } = await q;
    return (data as Convocatoria[]) ?? [];
  } catch {
    return [];
  }
}

// Próximas (fecha_torneo >= hoy), ascendente — para la portada.
export async function getUpcomingConvocatorias(limit = 3): Promise<Convocatoria[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("convocatorias")
      .select(COLS)
      .eq("estado", "publicado")
      .gte("fecha_torneo", new Date().toISOString())
      .order("fecha_torneo", { ascending: true })
      .limit(limit);
    return (data as Convocatoria[]) ?? [];
  } catch {
    return [];
  }
}

export async function getConvocatoriaBySlug(slug: string): Promise<Convocatoria | null> {
  try {
    const sb = await createClient();
    const { data } = await sb.from("convocatorias").select(COLS).eq("slug", slug).maybeSingle();
    return (data as Convocatoria) ?? null;
  } catch {
    return null;
  }
}

export async function getAllConvocatorias(): Promise<Convocatoria[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("convocatorias")
      .select(COLS)
      .order("fecha_torneo", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    return (data as Convocatoria[]) ?? [];
  } catch {
    return [];
  }
}

export async function getConvocatoriaById(id: string): Promise<Convocatoria | null> {
  try {
    const sb = await createClient();
    const { data } = await sb.from("convocatorias").select(COLS).eq("id", id).maybeSingle();
    return (data as Convocatoria) ?? null;
  } catch {
    return null;
  }
}
