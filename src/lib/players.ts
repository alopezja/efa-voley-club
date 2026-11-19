import { createClient } from "@/lib/supabase/server";
import { computeCompleteness } from "@/lib/profile-completeness";

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

export type PlayerAdmin = Player & { pct: number; equipos: { nombre: string; tipo: string }[] };

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

// Jugadores con su % de perfil (para el panel admin).
export async function getPlayersAdmin(): Promise<PlayerAdmin[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("players")
      .select(
        "id,nombre,apellido,email,telefono,estado,created_at,foto_url,posiciones,experiencia,fecha_nacimiento,eps,contacto_emergencia,mano_dominante,disponibilidad,quiere_camiseta,camiseta_color,camiseta_talla,team_members(numero,teams(nombre,tipo))"
      )
      .order("created_at", { ascending: false });

    return (data ?? []).map((p) => {
      const tm = p.team_members as unknown as
        | { numero: number | null; teams: { nombre: string; tipo: string } | null }[]
        | null;
      const tieneNumero = (tm ?? []).some((m) => m.numero != null);
      const equipos = (tm ?? [])
        .map((m) => m.teams)
        .filter((t): t is { nombre: string; tipo: string } => !!t);
      const pct = computeCompleteness({
        foto_url: p.foto_url,
        posiciones: (p.posiciones as string[]) ?? [],
        experiencia: p.experiencia,
        fecha_nacimiento: p.fecha_nacimiento,
        eps: p.eps,
        contacto_emergencia: p.contacto_emergencia,
        mano_dominante: p.mano_dominante,
        disponibilidad: (p.disponibilidad as string[]) ?? [],
        quiere_camiseta: p.quiere_camiseta,
        camiseta_color: p.camiseta_color,
        camiseta_talla: p.camiseta_talla,
        tieneNumero,
      }).pct;
      return {
        id: p.id,
        nombre: p.nombre,
        apellido: p.apellido,
        email: p.email,
        telefono: p.telefono,
        estado: p.estado as PlayerStatus,
        created_at: p.created_at,
        pct,
        equipos,
      };
    });
  } catch {
    return [];
  }
}
