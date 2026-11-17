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
