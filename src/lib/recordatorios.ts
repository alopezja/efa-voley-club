import { createAdminClient } from "@/lib/supabase/admin";
import { getGamesHoy } from "@/lib/games";
import { getConvocadosIds } from "@/lib/convocados";
import { notifyPlayer } from "@/lib/notifications";

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
    const cuerpo = `Hoy: ${g.titulo}${g.horaTexto ? ` a las ${g.horaTexto}` : ""}${g.lugar ? ` en ${g.lugar}` : ""}`;
    const aviso = { tipo: "recordatorio" as const, titulo: `${g.etiqueta} hoy`, cuerpo, url: "/jugador" };

    const recipients =
      g.tipo === "convocatoria" ? await getConvocadosIds(g.refId) : suscritos;

    await Promise.all(recipients.map((pid) => notifyPlayer(pid, aviso)));
    envios += recipients.length;
  }
  return { juegos: games.length, envios };
}
