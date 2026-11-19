"use server";

import { validateRegistro, type RegistroValues } from "@/lib/registro-validation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendClubNotification } from "@/lib/email";

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

  // Evitar correos duplicados: un correo solo puede registrarse una vez.
  // (El registro público no puede leer `players` por RLS, así que usamos service_role.)
  if (v.email) {
    const admin = createAdminClient();
    const { data: dup } = await admin
      .from("players")
      .select("id")
      .ilike("email", v.email)
      .limit(1)
      .maybeSingle();
    if (dup) {
      return {
        status: "error",
        errors: { email: "Ya existe un registro con este correo. Si ya te registraste, espera la aprobación del club." },
        values: input,
      };
    }
  }

  const sb = await createClient();
  const { error } = await sb.from("players").insert({
    nombre: v.nombre,
    apellido: v.apellido,
    email: v.email || null,
    telefono: v.telefono || null,
  });

  if (error) {
    // 23505 = violación de índice único (correo ya registrado, carrera).
    if ((error as { code?: string }).code === "23505") {
      return {
        status: "error",
        errors: { email: "Ya existe un registro con este correo." },
        values: input,
      };
    }
    return {
      status: "error",
      message: "No pudimos enviar tu registro. Intenta de nuevo en un momento.",
      values: input,
    };
  }

  await sendClubNotification(`Nuevo registro de jugador — ${v.nombre} ${v.apellido}`, [
    `Nombre: ${v.nombre} ${v.apellido}`,
    v.email ? `Correo: ${v.email}` : "",
    v.telefono ? `Teléfono: ${v.telefono}` : "",
    "",
    "Apruébalo en el panel: https://efavoleyclub.com/admin/jugadores",
  ]);

  return { status: "success" };
}
