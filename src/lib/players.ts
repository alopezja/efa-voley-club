import { createClient } from "@/lib/supabase/server";

export type PlayerStatus = "pendiente" | "aprobado" | "rechazado";

export type Player = {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  estado: PlayerStatus;
  created_at: string;
};

export async function getPlayers(): Promise<Player[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("players")
      .select("id,nombre,apellido,email,telefono,estado,created_at")
      .order("created_at", { ascending: false });
    return (data as Player[]) ?? [];
  } catch {
    return [];
  }
}
