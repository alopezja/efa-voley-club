import { createClient } from "@/lib/supabase/server";
import type { Team, TeamTipo, Membership } from "@/lib/teams-types";

export type { Team, TeamTipo, Membership } from "@/lib/teams-types";
export { TIPO_LABEL } from "@/lib/teams-types";

export async function getTeams(): Promise<Team[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("teams")
      .select("id, nombre, tipo, created_at, team_members(count)")
      .order("tipo", { ascending: true })
      .order("nombre", { ascending: true });
    return (data ?? []).map((t) => {
      const tm = t.team_members as unknown as { count: number }[] | null;
      return {
        id: t.id,
        nombre: t.nombre,
        tipo: t.tipo as TeamTipo,
        created_at: t.created_at,
        miembros: tm?.[0]?.count ?? 0,
      };
    });
  } catch {
    return [];
  }
}

// Números ya ocupados en un equipo (para validar/sugerir).
export async function getTeamOccupiedNumbers(teamId: string): Promise<number[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("team_members")
      .select("numero")
      .eq("team_id", teamId)
      .not("numero", "is", null);
    return (data ?? []).map((r) => r.numero as number);
  } catch {
    return [];
  }
}

// Membresías de un jugador (con datos del equipo).
export async function getPlayerMemberships(playerId: string): Promise<Membership[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("team_members")
      .select("id, team_id, player_id, numero, teams(nombre, tipo)")
      .eq("player_id", playerId);
    return (data ?? []).map((m) => {
      const team = m.teams as unknown as { nombre: string; tipo: TeamTipo } | null;
      return {
        id: m.id,
        team_id: m.team_id,
        player_id: m.player_id,
        numero: m.numero,
        team: team ? { nombre: team.nombre, tipo: team.tipo } : undefined,
      };
    });
  } catch {
    return [];
  }
}
