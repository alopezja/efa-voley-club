import { createClient } from "@/lib/supabase/server";

export type Challenge = {
  id: string;
  nombre: string;
  equipo: string | null;
  email: string | null;
  telefono: string | null;
  fecha_propuesta: string | null;
  lugar: string | null;
  mensaje: string | null;
  leido: boolean;
  created_at: string;
};

export async function getChallenges(): Promise<Challenge[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("challenges")
      .select("id,nombre,equipo,email,telefono,fecha_propuesta,lugar,mensaje,leido,created_at")
      .order("created_at", { ascending: false });
    return (data as Challenge[]) ?? [];
  } catch {
    return [];
  }
}
