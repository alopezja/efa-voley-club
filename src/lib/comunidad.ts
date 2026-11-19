import { createAdminClient } from "@/lib/supabase/admin";

// Nota: estas lecturas usan service_role y se llaman SOLO desde páginas del
// portal ya protegidas con requireJugador(). Exponen datos básicos de
// compañeros (nombre, número, posición, foto) a miembros del mismo equipo.

export type Companero = {
  id: string;
  nombre: string;
  apellido: string;
  foto_url: string | null;
  numero: number | null;
  posiciones: string[];
};
export type EquipoRoster = {
  teamId: string;
  nombre: string;
  tipo: string;
  miembros: Companero[];
};

export async function getMisEquiposRoster(playerId: string): Promise<EquipoRoster[]> {
  try {
    const admin = createAdminClient();
    const { data: mine } = await admin.from("team_members").select("team_id").eq("player_id", playerId);
    const teamIds = [...new Set((mine ?? []).map((m) => m.team_id as string))];
    if (teamIds.length === 0) return [];

    const { data } = await admin
      .from("team_members")
      .select("team_id, numero, teams(nombre,tipo), players(id,nombre,apellido,foto_url,posiciones)")
      .in("team_id", teamIds);

    const map = new Map<string, EquipoRoster>();
    for (const row of data ?? []) {
      const team = row.teams as unknown as { nombre: string; tipo: string } | null;
      const p = row.players as unknown as Companero | null;
      if (!team || !p) continue;
      if (!map.has(row.team_id)) {
        map.set(row.team_id, { teamId: row.team_id, nombre: team.nombre, tipo: team.tipo, miembros: [] });
      }
      map.get(row.team_id)!.miembros.push({
        id: p.id,
        nombre: p.nombre,
        apellido: p.apellido,
        foto_url: p.foto_url,
        numero: (row.numero as number | null) ?? null,
        posiciones: (p.posiciones as string[]) ?? [],
      });
    }
    const equipos = [...map.values()];
    for (const e of equipos) {
      e.miembros.sort((a, b) => (a.numero ?? 999) - (b.numero ?? 999));
    }
    return equipos;
  } catch {
    return [];
  }
}

export type Cumple = { nombre: string; dia: number };

export async function getCumpleanosDelMes(): Promise<Cumple[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("players")
      .select("nombre,apellido,fecha_nacimiento")
      .eq("estado", "aprobado")
      .not("fecha_nacimiento", "is", null);
    const mesActual = new Date().getMonth() + 1; // 1-12
    const out: Cumple[] = [];
    for (const p of data ?? []) {
      const f = String(p.fecha_nacimiento); // YYYY-MM-DD
      const mes = parseInt(f.slice(5, 7), 10);
      const dia = parseInt(f.slice(8, 10), 10);
      if (mes === mesActual) out.push({ nombre: `${p.nombre} ${p.apellido}`.trim(), dia });
    }
    return out.sort((a, b) => a.dia - b.dia);
  } catch {
    return [];
  }
}

export async function getResumenLogros(playerId: string): Promise<{ perfilCompleto: boolean; totalVoy: number }> {
  try {
    const admin = createAdminClient();
    const { data: p } = await admin
      .from("players")
      .select("perfil_completo_at")
      .eq("id", playerId)
      .maybeSingle();
    const { count } = await admin
      .from("asistencias")
      .select("*", { count: "exact", head: true })
      .eq("player_id", playerId)
      .eq("estado", "voy");
    return { perfilCompleto: !!p?.perfil_completo_at, totalVoy: count ?? 0 };
  } catch {
    return { perfilCompleto: false, totalVoy: 0 };
  }
}
