"use server";

import { validateRegistro, type RegistroValues } from "@/lib/registro-validation";
import { createClient } from "@/lib/supabase/server";

export type RegistroState = {
  status: "idle" | "success" | "error";
  errors?: Record<string, string>;
  message?: string;
  values?: RegistroValues;
};

export async function registerPlayer(
  _prev: RegistroState,
  formData: FormData
): Promise<RegistroState> {
  const input = {
    nombre: String(formData.get("nombre") ?? ""),
    apellido: String(formData.get("apellido") ?? ""),
    email: String(formData.get("email") ?? ""),
    telefono: String(formData.get("telefono") ?? ""),
  };

  const check = validateRegistro(input);
  if (!check.ok) return { status: "error", errors: check.errors, values: input };

  const v = check.values;
  const sb = await createClient();
  const { error } = await sb.from("players").insert({
    nombre: v.nombre,
    apellido: v.apellido,
    email: v.email || null,
    telefono: v.telefono || null,
  });

  if (error) {
    return {
      status: "error",
      message: "No pudimos enviar tu registro. Intenta de nuevo en un momento.",
      values: input,
    };
  }

  return { status: "success" };
}
