"use server";

import { revalidatePath } from "next/cache";
import { requireJugador } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMiPlayer, toCompletenessInput } from "@/lib/player-profile";
import { getPlayerMemberships } from "@/lib/teams";
import { validarPosiciones } from "@/lib/positions";
import { validarNumero } from "@/lib/teams-validation";
import { computeCompleteness } from "@/lib/profile-completeness";
import { uploadToR2 } from "@/lib/r2";

export type ProfileState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
};

const COLORES = ["roja", "negra", "ambas"];
const TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];
const MANOS = ["diestro", "zurdo", "no_se"];

export async function guardarPerfil(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const { user } = await requireJugador();
  const player = await getMiPlayer(user.id);
  if (!player) return { status: "error", message: "No encontramos tu registro." };

  const admin = createAdminClient();
  const errors: Record<string, string> = {};

  // --- Leer campos ---
  const posiciones = formData.getAll("posiciones").map(String);
  const experiencia = Number(formData.get("experiencia"));
  const fecha_nacimiento = String(formData.get("fecha_nacimiento") ?? "").trim() || null;
  const eps = String(formData.get("eps") ?? "").trim() || null;
  const contacto_emergencia = String(formData.get("contacto_emergencia") ?? "").trim() || null;
  const mano_dominante = String(formData.get("mano_dominante") ?? "").trim() || null;
  const apodo = String(formData.get("apodo") ?? "").trim() || null;
  const disponibilidad = formData.getAll("disponibilidad").map(String);
  const quiereRaw = String(formData.get("quiere_camiseta") ?? "");
  const quiere_camiseta = quiereRaw === "si" ? true : quiereRaw === "no" ? false : null;
  const camiseta_color = quiere_camiseta ? String(formData.get("camiseta_color") ?? "") || null : null;
  const camiseta_talla = quiere_camiseta ? String(formData.get("camiseta_talla") ?? "") || null : null;

  // --- Validaciones ---
  if (!validarPosiciones(posiciones).ok) errors.posiciones = "Elige 1 o 2 posiciones (o 'Aún no sé').";
  if (!Number.isFinite(experiencia) || !validarNumero(experiencia).ok || experiencia > 10)
    errors.experiencia = "Indica tu experiencia (1 a 10).";
  if (mano_dominante && !MANOS.includes(mano_dominante)) errors.mano_dominante = "Valor inválido.";
  if (quiere_camiseta === true) {
    if (!camiseta_color || !COLORES.includes(camiseta_color)) errors.camiseta = "Elige el color de la camiseta.";
    if (!camiseta_talla || !TALLAS.includes(camiseta_talla)) errors.camiseta = "Elige la talla de la camiseta.";
  }

  // --- Números por equipo ---
  const memberships = await getPlayerMemberships(player.id);
  const numeroUpdates: { membershipId: string; numero: number }[] = [];
  for (const m of memberships) {
    const raw = formData.get(`numero_${m.team_id}`);
    if (raw == null || String(raw).trim() === "") continue;
    const numero = Number(raw);
    if (!validarNumero(numero).ok) {
      errors[`numero_${m.team_id}`] = "Número entre 1 y 99.";
      continue;
    }
    // ¿libre en ese equipo? (excluye la propia membresía)
    const { data: ocupa } = await admin
      .from("team_members")
      .select("id")
      .eq("team_id", m.team_id)
      .eq("numero", numero)
      .neq("player_id", player.id)
      .limit(1)
      .maybeSingle();
    if (ocupa) {
      errors[`numero_${m.team_id}`] = `El número ${numero} ya está tomado en ese equipo.`;
      continue;
    }
    numeroUpdates.push({ membershipId: m.id, numero });
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Revisa los campos marcados.", errors };
  }

  // --- Foto (ya viene comprimida del cliente) ---
  let foto_url = player.foto_url;
  const foto = formData.get("foto");
  if (foto instanceof File && foto.size > 0) {
    try {
      const buffer = new Uint8Array(await foto.arrayBuffer());
      const res = await uploadToR2("jugadores", foto.name || "foto.jpg", foto.type || "image/jpeg", buffer);
      foto_url = res.publicUrl;
    } catch {
      return { status: "error", message: "No pudimos subir la foto. Intenta de nuevo." };
    }
  }

  // --- Guardar players ---
  const update = {
    foto_url,
    posiciones,
    experiencia,
    fecha_nacimiento,
    eps,
    contacto_emergencia,
    mano_dominante,
    disponibilidad,
    quiere_camiseta,
    camiseta_color,
    camiseta_talla,
    apodo,
  };
  const { error: updErr } = await admin.from("players").update(update).eq("id", player.id);
  if (updErr) return { status: "error", message: "No se pudo guardar. Intenta de nuevo." };

  // --- Guardar números ---
  for (const u of numeroUpdates) {
    await admin.from("team_members").update({ numero: u.numero }).eq("id", u.membershipId);
  }

  // --- Marcar 100% si corresponde ---
  const freshMemberships = await getPlayerMemberships(player.id);
  const completeness = computeCompleteness(
    toCompletenessInput({ ...player, ...update }, freshMemberships)
  );
  if (completeness.pct >= 100 && !player.perfil_completo_at) {
    await admin.from("players").update({ perfil_completo_at: new Date().toISOString() }).eq("id", player.id);
  }

  revalidatePath("/jugador");
  revalidatePath("/jugador/perfil");
  return {
    status: "success",
    message:
      completeness.pct >= 100
        ? "¡Perfil completo! 🎉 Guardado."
        : `Guardado. Tu perfil va en ${completeness.pct}%.`,
  };
}
