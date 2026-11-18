"use server";

import { validateContact } from "@/lib/contact-validation";
import { createClient } from "@/lib/supabase/server";
import { sendClubNotification } from "@/lib/email";

export type ContactState = {
  status: "idle" | "success" | "error";
  errors?: Record<string, string>;
  message?: string;
  values?: { nombre: string; email: string; mensaje: string };
};

export async function sendContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const values = {
    nombre: String(formData.get("nombre") ?? ""),
    email: String(formData.get("email") ?? ""),
    mensaje: String(formData.get("mensaje") ?? ""),
  };

  const check = validateContact(values);
  if (!check.ok) {
    return { status: "error", errors: check.errors, values };
  }

  const sb = await createClient();
  const { error } = await sb.from("contact_messages").insert({
    nombre: values.nombre.trim(),
    email: values.email.trim(),
    mensaje: values.mensaje.trim(),
  });

  if (error) {
    return {
      status: "error",
      message: "No pudimos enviar tu mensaje. Intenta de nuevo en un momento.",
      values,
    };
  }

  await sendClubNotification(`Nuevo mensaje de contacto — ${values.nombre.trim()}`, [
    `Nombre: ${values.nombre.trim()}`,
    `Correo: ${values.email.trim()}`,
    "",
    values.mensaje.trim(),
    "",
    "Míralo en el panel: https://efavoleyclub.com/admin/mensajes",
  ]);

  return { status: "success" };
}
