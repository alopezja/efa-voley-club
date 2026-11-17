"use server";

import { validateChallenge, type ChallengeValues } from "@/lib/challenge-validation";
import { createClient } from "@/lib/supabase/server";

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

  return { status: "success" };
}
