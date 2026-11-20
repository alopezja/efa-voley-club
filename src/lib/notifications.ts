import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToPlayer } from "@/lib/push";

export type NotifTipo = "aviso" | "convocatoria" | "recordatorio";

export type Notif = {
  id: string;
  tipo: NotifTipo;
  titulo: string;
  cuerpo: string | null;
  url: string | null;
  read_at: string | null;
  created_at: string;
};

export type NuevoAviso = {
  tipo?: NotifTipo;
  titulo: string;
  cuerpo?: string;
  url?: string;
};

// Punto único de notificación: guarda el aviso en el buzón del jugador y además
// envía el push al navegador (best-effort). Reemplaza las llamadas sueltas a
// sendPushToPlayer para que todo quede registrado en la bandeja.
export async function notifyPlayer(playerId: string, aviso: NuevoAviso): Promise<void> {
  const tipo = aviso.tipo ?? "aviso";
  try {
    const admin = createAdminClient();
    await admin.from("notifications").insert({
      player_id: playerId,
      tipo,
      titulo: aviso.titulo,
      cuerpo: aviso.cuerpo ?? null,
      url: aviso.url ?? null,
    });
  } catch {
    // best-effort: si falla el guardado igual intentamos el push
  }
  await sendPushToPlayer(playerId, {
    title: aviso.titulo,
    body: aviso.cuerpo ?? "",
    url: aviso.url,
  });
}

// Notifica a varios jugadores (sin duplicados).
export async function notifyPlayers(playerIds: string[], aviso: NuevoAviso): Promise<number> {
  const ids = [...new Set(playerIds)].filter(Boolean);
  await Promise.all(ids.map((pid) => notifyPlayer(pid, aviso)));
  return ids.length;
}

// Bandeja del jugador: lista (más reciente primero) + cuántas sin leer.
export async function getMisNotificaciones(
  playerId: string,
  limite = 50
): Promise<{ items: Notif[]; unread: number }> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("notifications")
      .select("id, tipo, titulo, cuerpo, url, read_at, created_at")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false })
      .limit(limite);
    const items = (data as Notif[] | null) ?? [];
    const unread = items.filter((n) => n.read_at == null).length;
    return { items, unread };
  } catch {
    return { items: [], unread: 0 };
  }
}
