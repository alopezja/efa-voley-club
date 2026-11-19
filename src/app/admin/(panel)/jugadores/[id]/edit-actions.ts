"use server";

import { revalidatePath } from "next/cache";
import { requirePerm } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlayerMemberships } from "@/lib/teams";
import { validarPosiciones } from "@/lib/positions";
import { validarNumero } from "@/lib/teams-validation";

export type AdminPlayerState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
};

// Agrega al jugador a un equipo (si no está ya).
export async function agregarAEquipo(formData: FormData): Promise<void> {
  await requirePerm("jugadores");
  const playerId = String(formData.get("playerId") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  if (!playerId || !teamId) return;
  const admin = createAdminClient();
  await admin
    .from("team_members")
    .upsert({ team_id: teamId, player_id: playerId }, { onConflict: "team_id,player_id", ignoreDuplicates: true });
  revalidatePath(`/admin/jugadores/${playerId}`);
}

// Quita al jugador de un equipo.
export async function quitarDeEquipo(formData: FormData): Promise<void> {
  await requirePerm("jugadores");
  const playerId = String(formData.get("playerId") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  if (!playerId || !teamId) return;
  const admin = createAdminClient();
  await admin.from("team_members").delete().eq("team_id", teamId).eq("player_id", playerId);
  revalidatePath(`/admin/jugadores/${playerId}`);
}

const COLORES = ["roja", "negra", "ambas"];
const TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];
const MANOS = ["diestro", "zurdo", "no_se"];

export async function guardarJugadorAdmin(
  _prev: AdminPlayerState,
  formData: FormData
): Promise<AdminPlayerState> {
  await requirePerm("jugadores");
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Falta el jugador." };

  const errors: Record<string, string> = {};
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const telefono = String(formData.get("telefono") ?? "").trim() || null;
  const fecha_nacimiento = String(formData.get("fecha_nacimiento") ?? "").trim() || null;
  const posiciones = formData.getAll("posiciones").map(String);
  const experienciaRaw = formData.get("experiencia");
  const experiencia = experienciaRaw != null && experienciaRaw !== "" ? Number(experienciaRaw) : null;
  const mano_dominante = String(formData.get("mano_dominante") ?? "").trim() || null;
  const eps = String(formData.get("eps") ?? "").trim() || null;
  const contacto_emergencia = String(formData.get("contacto_emergencia") ?? "").trim() || null;
  const disponibilidad = formData.getAll("disponibilidad").map(String);
  const quiereRaw = String(formData.get("quiere_camiseta") ?? "");
  const quiere_camiseta = quiereRaw === "si" ? true : quiereRaw === "no" ? false : null;
  const camiseta_color = quiere_camiseta ? String(formData.get("camiseta_color") ?? "") || null : null;
  const camiseta_talla = quiere_camiseta ? String(formData.get("camiseta_talla") ?? "") || null : null;
  const apodo = String(formData.get("apodo") ?? "").trim() || null;

  if (nombre.length < 2) errors.nombre = "Escribe el nombre.";
  if (apellido.length < 2) errors.apellido = "Escribe el apellido.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Correo inválido.";
  if (posiciones.length > 0 && !validarPosiciones(posiciones).ok) errors.posiciones = "Máximo 2 posiciones.";
  if (experiencia != null && (!Number.isFinite(experiencia) || experiencia < 1 || experiencia > 10))
    errors.experiencia = "Experiencia entre 1 y 10.";
  if (mano_dominante && !MANOS.includes(mano_dominante)) errors.mano_dominante = "Valor inválido.";
  if (quiere_camiseta === true) {
    if (!camiseta_color || !COLORES.includes(camiseta_color)) errors.camiseta = "Elige color.";
    if (!camiseta_talla || !TALLAS.includes(camiseta_talla)) errors.camiseta = "Elige talla.";
  }

  const admin = createAdminClient();

  // Correo único (excluye al propio jugador).
  if (email) {
    const { data: dup } = await admin
      .from("players")
      .select("id")
      .ilike("email", email)
      .neq("id", id)
      .limit(1)
      .maybeSingle();
    if (dup) errors.email = "Otro jugador ya tiene este correo.";
  }

  // Números por equipo.
  const memberships = await getPlayerMemberships(id);
  const numeroUpdates: { membershipId: string; numero: number }[] = [];
  for (const m of memberships) {
    const raw = formData.get(`numero_${m.team_id}`);
    if (raw == null || String(raw).trim() === "") continue;
    const numero = Number(raw);
    if (!validarNumero(numero).ok) {
      errors[`numero_${m.team_id}`] = "Número entre 1 y 99.";
      continue;
    }
    const { data: ocupa } = await admin
      .from("team_members")
      .select("id")
      .eq("team_id", m.team_id)
      .eq("numero", numero)
      .neq("player_id", id)
      .limit(1)
      .maybeSingle();
    if (ocupa) {
      errors[`numero_${m.team_id}`] = `El número ${numero} ya está tomado en ese equipo.`;
      continue;
    }
    numeroUpdates.push({ membershipId: m.id, numero });
  }

  if (Object.keys(errors).length > 0) return { status: "error", message: "Revisa los campos marcados.", errors };

  const { error } = await admin
    .from("players")
    .update({
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      posiciones,
      experiencia,
      mano_dominante,
      eps,
      contacto_emergencia,
      disponibilidad,
      quiere_camiseta,
      camiseta_color,
      camiseta_talla,
      apodo,
    })
    .eq("id", id);
  if (error) return { status: "error", message: "No se pudo guardar. Intenta de nuevo." };

  for (const u of numeroUpdates) {
    await admin.from("team_members").update({ numero: u.numero }).eq("id", u.membershipId);
  }

  revalidatePath(`/admin/jugadores/${id}`);
  revalidatePath("/admin/jugadores");
  return { status: "success", message: "Datos del jugador guardados." };
}
