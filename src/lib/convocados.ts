import { createClient } from "@/lib/supabase/server";
import type { Convocatoria } from "@/lib/convocatorias";

const COLS =
  "id,titulo,slug,tipo,fecha_torneo,lugar,categoria,descripcion,imagen_portada_url,estado,created_at,updated_at";

// Ids de los jugadores convocados a una convocatoria (para el editor admin).
export async function getConvocadosIds(convocatoriaId: string): Promise<string[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("convocatoria_jugadores")
      .select("player_id")
      .eq("convocatoria_id", convocatoriaId);
    return (data ?? []).map((r) => r.player_id as string);
  } catch {
    return [];
  }
}

// Convocatorias futuras a las que el jugador está convocado (para el banner).
export async function getConvocatoriasDeJugador(playerId: string): Promise<Convocatoria[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("convocatoria_jugadores")
      .select(`convocatorias(${COLS})`)
      .eq("player_id", playerId);
    const hoy = new Date();
    const convs = (data ?? [])
      .map((r) => r.convocatorias as unknown as Convocatoria | null)
      .filter((c): c is Convocatoria => !!c)
      .filter((c) => c.fecha_torneo && new Date(c.fecha_torneo) >= hoy)
      .sort((a, b) => new Date(a.fecha_torneo!).getTime() - new Date(b.fecha_torneo!).getTime());
    return convs;
  } catch {
    return [];
  }
}

// Sincroniza la lista de convocados (reemplaza todos). Devuelve los IDs de los
// jugadores NUEVOS (para notificarles).
export async function syncConvocados(convocatoriaId: string, playerIds: string[]): Promise<string[]> {
  const sb = await createClient();
  const { data: existing } = await sb
    .from("convocatoria_jugadores")
    .select("player_id")
    .eq("convocatoria_id", convocatoriaId);
  const prev = new Set((existing ?? []).map((r) => r.player_id as string));

  await sb.from("convocatoria_jugadores").delete().eq("convocatoria_id", convocatoriaId);
  if (playerIds.length > 0) {
    await sb
      .from("convocatoria_jugadores")
      .insert(playerIds.map((player_id) => ({ convocatoria_id: convocatoriaId, player_id })));
  }
  return playerIds.filter((id) => !prev.has(id));
}
