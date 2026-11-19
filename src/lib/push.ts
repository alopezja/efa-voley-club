import * as webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

let configured = false;
function configurar(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:efavoleyclub@gmail.com";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export type PushPayload = { title: string; body: string; url?: string };

// Envía una notificación push a todas las suscripciones de un jugador.
// Best-effort: borra las suscripciones muertas (410/404).
export async function sendPushToPlayer(playerId: string, payload: PushPayload): Promise<void> {
  if (!configurar()) return;
  try {
    const admin = createAdminClient();
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("player_id", playerId);

    await Promise.all(
      (subs ?? []).map(async (s) => {
        const sub = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
        try {
          await webpush.sendNotification(sub, JSON.stringify(payload));
        } catch (err: unknown) {
          const code = (err as { statusCode?: number })?.statusCode;
          if (code === 404 || code === 410) {
            await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          }
        }
      })
    );
  } catch {
    // best-effort
  }
}
