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

export type RosterMiembro = {
  nombre: string;
  apellido: string;
  numero: number | null;
  posiciones: string[];
  foto_url: string | null;
};
export type TeamConRoster = {
  id: string;
  nombre: string;
  tipo: TeamTipo;
  miembros: RosterMiembro[];
};

// Todos los equipos con sus jugadores (para el panel admin).
export async function getTeamsConRoster(): Promise<TeamConRoster[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("teams")
      .select("id, nombre, tipo, team_members(numero, players(nombre, apellido, posiciones, foto_url))")
      .order("tipo", { ascending: true })
      .order("nombre", { ascending: true });

    return (data ?? []).map((t) => {
      const tm = (t.team_members ?? []) as unknown as {
        numero: number | null;
        players: { nombre: string; apellido: string; posiciones: string[]; foto_url: string | null } | null;
      }[];
      const miembros: RosterMiembro[] = tm
        .filter((m) => m.players)
        .map((m) => ({
          nombre: m.players!.nombre,
          apellido: m.players!.apellido,
          numero: m.numero,
          posiciones: m.players!.posiciones ?? [],
          foto_url: m.players!.foto_url,
        }))
        .sort((a, b) => (a.numero ?? 999) - (b.numero ?? 999));
      return { id: t.id, nombre: t.nombre, tipo: t.tipo as TeamTipo, miembros };
    });
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
