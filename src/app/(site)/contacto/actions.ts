"use server";

import { validateContact } from "@/lib/contact-validation";
import { createClient } from "@/lib/supabase/server";

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

  // TODO: enviar aviso por correo con Resend (fase posterior)

  return { status: "success" };
}
