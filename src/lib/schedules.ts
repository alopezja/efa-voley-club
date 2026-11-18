import { createClient } from "@/lib/supabase/server";

export type Schedule = {
  id: string;
  dia: string;
  horario: string | null;
  lugar: string | null;
  descripcion: string | null;
  maps_url: string | null;
  orden: number;
  created_at: string;
};

// Devuelve una URL embebible de Google Maps (sin API key) para la portada.
// Usa las coordenadas del enlace de Maps si las trae; si no, busca por el nombre del lugar.
export function mapEmbedSrc(s: { lugar: string | null; maps_url: string | null }): string | null {
  const coord =
    s.maps_url?.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ??
    s.maps_url?.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  const q = coord ? `${coord[1]},${coord[2]}` : (s.lugar ?? "").trim();
  if (!q) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
}

export async function getSchedules(): Promise<Schedule[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("schedules")
      .select("id,dia,horario,lugar,descripcion,maps_url,orden,created_at")
      .order("orden", { ascending: true })
      .order("created_at", { ascending: true });
    return (data as Schedule[]) ?? [];
  } catch {
    return [];
  }
}
