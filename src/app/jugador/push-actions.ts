"use server";

import { requireJugador } from "@/lib/auth";
import { getMiPlayer } from "@/lib/player-profile";
import { createAdminClient } from "@/lib/supabase/admin";

type Sub = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function guardarSuscripcion(sub: Sub): Promise<{ ok: boolean }> {
  const { user } = await requireJugador();
  const player = await getMiPlayer(user.id);
  if (!player || !sub?.endpoint || !sub.keys?.p256dh) return { ok: false };

  const admin = createAdminClient();
  const { error } = await admin.from("push_subscriptions").upsert(
    { player_id: player.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    { onConflict: "endpoint" }
  );
  return { ok: !error };
}

export async function borrarSuscripcion(endpoint: string): Promise<{ ok: boolean }> {
  const { user } = await requireJugador();
  const player = await getMiPlayer(user.id);
  if (!player || !endpoint) return { ok: false };
  const admin = createAdminClient();
  await admin.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("player_id", player.id);
  return { ok: true };
}
