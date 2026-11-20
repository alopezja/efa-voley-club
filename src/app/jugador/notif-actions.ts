"use server";

import { requireJugador } from "@/lib/auth";
import { getMiPlayer } from "@/lib/player-profile";
import { getMisNotificaciones, type Notif } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";

export type BuzonState = { items: Notif[]; unread: number };

const VACIO: BuzonState = { items: [], unread: 0 };

async function miPlayerId(): Promise<string | null> {
  const { user } = await requireJugador();
  const p = await getMiPlayer(user.id);
  return p?.id ?? null;
}

// Devuelve la bandeja fresca del jugador.
export async function refrescarNotificaciones(): Promise<BuzonState> {
  const pid = await miPlayerId();
  if (!pid) return VACIO;
  return getMisNotificaciones(pid);
}

// Marca una notificación como leída (solo si es del jugador).
export async function marcarLeida(id: string): Promise<BuzonState> {
  const pid = await miPlayerId();
  if (!pid || !id) return VACIO;
  const admin = createAdminClient();
  await admin
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("player_id", pid)
    .is("read_at", null);
  return getMisNotificaciones(pid);
}

// Marca todas las del jugador como leídas.
export async function marcarTodasLeidas(): Promise<BuzonState> {
  const pid = await miPlayerId();
  if (!pid) return VACIO;
  const admin = createAdminClient();
  await admin
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("player_id", pid)
    .is("read_at", null);
  return getMisNotificaciones(pid);
}

// Elimina una notificación del buzón del jugador.
export async function eliminarNotificacion(id: string): Promise<BuzonState> {
  const pid = await miPlayerId();
  if (!pid || !id) return VACIO;
  const admin = createAdminClient();
  await admin.from("notifications").delete().eq("id", id).eq("player_id", pid);
  return getMisNotificaciones(pid);
}
