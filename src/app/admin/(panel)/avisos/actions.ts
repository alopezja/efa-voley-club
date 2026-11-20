"use server";

import { requirePerm } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAprobadosBasico } from "@/lib/players";
import { notifyPlayers } from "@/lib/notifications";

export type AvisoState = {
  status: "idle" | "success" | "error";
  message?: string;
  values?: { destino?: string; teamId?: string; playerId?: string; titulo?: string; cuerpo?: string; url?: string };
};

// Resuelve los jugadores destinatarios según el destino elegido.
async function resolverDestinatarios(
  destino: string,
  teamId: string,
  playerId: string
): Promise<string[]> {
  if (destino === "jugador") return playerId ? [playerId] : [];
  if (destino === "equipo") {
    if (!teamId) return [];
    const admin = createAdminClient();
    const { data } = await admin.from("team_members").select("player_id").eq("team_id", teamId);
    return (data ?? []).map((r) => r.player_id as string);
  }
  // todos
  const aprobados = await getAprobadosBasico();
  return aprobados.map((p) => p.id);
}

export async function enviarAviso(_prev: AvisoState, formData: FormData): Promise<AvisoState> {
  await requirePerm("avisos");

  const destino = String(formData.get("destino") ?? "todos");
  const teamId = String(formData.get("teamId") ?? "");
  const playerId = String(formData.get("playerId") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const cuerpo = String(formData.get("cuerpo") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const values = { destino, teamId, playerId, titulo, cuerpo, url };

  if (titulo.length < 3) return { status: "error", message: "Escribe un título (mínimo 3 caracteres).", values };
  if (destino === "equipo" && !teamId) return { status: "error", message: "Elige un equipo.", values };
  if (destino === "jugador" && !playerId) return { status: "error", message: "Elige un jugador.", values };
  if (url && !/^https?:\/\/|^\//.test(url))
    return { status: "error", message: "El enlace debe empezar por http, https o /.", values };

  const ids = await resolverDestinatarios(destino, teamId, playerId);
  if (ids.length === 0) return { status: "error", message: "No hay jugadores para ese destino.", values };

  const enviados = await notifyPlayers(ids, {
    tipo: "aviso",
    titulo,
    cuerpo: cuerpo || undefined,
    url: url || undefined,
  });

  return {
    status: "success",
    message: `Aviso enviado a ${enviados} ${enviados === 1 ? "jugador" : "jugadores"}.`,
  };
}
