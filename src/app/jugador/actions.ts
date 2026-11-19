"use server";

import { revalidatePath } from "next/cache";
import { requireJugador } from "@/lib/auth";
import { getMiPlayer } from "@/lib/player-profile";
import { createAdminClient } from "@/lib/supabase/admin";

export type AsistenciaState = { status: "idle" | "success" | "error"; message?: string };

const TIPOS = ["entreno", "convocatoria"];
const ESTADOS = ["voy", "no_voy"];
const ZONAS = ["tobillo", "rodilla", "hombro", "dedo", "espalda", "otro"];
const NIVELES = ["leve", "lesion", "no_juego"];

export async function marcarAsistencia(
  _prev: AsistenciaState,
  formData: FormData
): Promise<AsistenciaState> {
  const { user } = await requireJugador();
  const player = await getMiPlayer(user.id);
  if (!player) return { status: "error", message: "No encontramos tu registro." };

  const tipo = String(formData.get("tipo") ?? "");
  const ref_id = String(formData.get("refId") ?? "");
  const fecha = String(formData.get("fecha") ?? "");
  const estado = String(formData.get("estado") ?? "");

  if (!TIPOS.includes(tipo) || !ref_id || !fecha || !ESTADOS.includes(estado)) {
    return { status: "error", message: "Datos inválidos." };
  }

  let molestia_zona: string | null = null;
  let molestia_nivel: string | null = null;
  let molestia_nota: string | null = null;
  if (estado === "no_voy") {
    const z = String(formData.get("molestia_zona") ?? "");
    const n = String(formData.get("molestia_nivel") ?? "");
    molestia_zona = ZONAS.includes(z) ? z : null;
    molestia_nivel = NIVELES.includes(n) ? n : null;
    molestia_nota = String(formData.get("molestia_nota") ?? "").trim() || null;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("asistencias").upsert(
    {
      player_id: player.id,
      tipo,
      ref_id,
      fecha,
      estado,
      molestia_zona,
      molestia_nivel,
      molestia_nota,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "player_id,tipo,ref_id,fecha" }
  );
  if (error) return { status: "error", message: "No se pudo guardar. Intenta de nuevo." };

  revalidatePath("/jugador");
  return {
    status: "success",
    message: estado === "voy" ? "¡Confirmado, nos vemos! 🏐" : "Gracias por avisar.",
  };
}
