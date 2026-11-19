import { createAdminClient } from "@/lib/supabase/admin";
import { getGamesHoy } from "@/lib/games";
import { getConvocadosIds } from "@/lib/convocados";
import { sendPushToPlayer } from "@/lib/push";

// Envía un push a los jugadores por cada juego de HOY.
// Entrenos/juegos recurrentes → todos los jugadores suscritos.
// Convocatorias → los convocados.
export async function enviarRecordatoriosHoy(): Promise<{ juegos: number; envios: number }> {
  const games = await getGamesHoy();
  if (games.length === 0) return { juegos: 0, envios: 0 };

  const admin = createAdminClient();
  const { data: subs } = await admin.from("push_subscriptions").select("player_id");
  const suscritos = [...new Set((subs ?? []).map((s) => s.player_id as string))];

  let envios = 0;
  for (const g of games) {
    const body = `Hoy: ${g.titulo}${g.horaTexto ? ` a las ${g.horaTexto}` : ""}${g.lugar ? ` en ${g.lugar}` : ""}`;
    const payload = { title: `🏐 ${g.etiqueta} hoy`, body, url: "/jugador" };

    const recipients =
      g.tipo === "convocatoria" ? await getConvocadosIds(g.refId) : suscritos;

    await Promise.all(recipients.map((pid) => sendPushToPlayer(pid, payload)));
    envios += recipients.length;
  }
  return { juegos: games.length, envios };
}
