"use server";

import { validateChallenge, type ChallengeValues } from "@/lib/challenge-validation";
import { createClient } from "@/lib/supabase/server";
import { sendClubNotification } from "@/lib/email";

export type ChallengeState = {
  status: "idle" | "success" | "error";
  errors?: Record<string, string>;
  message?: string;
  values?: ChallengeValues;
};

export async function sendChallenge(
  _prev: ChallengeState,
  formData: FormData
): Promise<ChallengeState> {
  const input = {
    nombre: String(formData.get("nombre") ?? ""),
    equipo: String(formData.get("equipo") ?? ""),
    categoria: String(formData.get("categoria") ?? ""),
    email: String(formData.get("email") ?? ""),
    telefono: String(formData.get("telefono") ?? ""),
    fecha_propuesta: String(formData.get("fecha_propuesta") ?? ""),
    lugar: String(formData.get("lugar") ?? ""),
    mensaje: String(formData.get("mensaje") ?? ""),
  };

  const check = validateChallenge(input);
  if (!check.ok) return { status: "error", errors: check.errors, values: input };

  const v = check.values;
  const sb = await createClient();
  const { error } = await sb.from("challenges").insert({
    nombre: v.nombre,
    equipo: v.equipo || null,
    categoria: v.categoria,
    email: v.email || null,
    telefono: v.telefono || null,
    fecha_propuesta: v.fecha_propuesta || null,
    lugar: v.lugar || null,
    mensaje: v.mensaje || null,
  });

  if (error) {
    return {
      status: "error",
      message: "No pudimos enviar tu reto. Intenta de nuevo en un momento.",
      values: input,
    };
  }

  await sendClubNotification(`Nuevo reto al club — ${v.nombre}${v.equipo ? ` (${v.equipo})` : ""}`, [
    `De: ${v.nombre}${v.equipo ? ` — ${v.equipo}` : ""}`,
    v.categoria ? `Categoría: ${v.categoria}` : "",
    v.email ? `Correo: ${v.email}` : "",
    v.telefono ? `Teléfono: ${v.telefono}` : "",
    v.fecha_propuesta ? `Fecha propuesta: ${v.fecha_propuesta}` : "",
    v.lugar ? `Lugar: ${v.lugar}` : "",
    v.mensaje ? `\n${v.mensaje}` : "",
    "",
    "Míralo en el panel: https://efavoleyclub.com/admin/retos",
  ]);

  return { status: "success" };
}
