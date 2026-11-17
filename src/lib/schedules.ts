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
