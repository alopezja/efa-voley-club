"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AccesoState = { status: "idle" | "success" | "error"; message?: string };

export async function enviarEnlace(_prev: AccesoState, formData: FormData): Promise<AccesoState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Escribe un correo válido." };
  }

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const emailRedirectTo = `${proto}://${host}/auth/callback?next=/jugador`;

  const sb = await createClient();
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo, shouldCreateUser: true },
  });
  if (error) {
    return { status: "error", message: "No pudimos enviar el enlace. Intenta de nuevo." };
  }

  return {
    status: "success",
    message: "Te enviamos un enlace a tu correo. Ábrelo para entrar (revisa también spam).",
  };
}
