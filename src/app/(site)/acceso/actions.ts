"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAccessLink } from "@/lib/email";

export type AccesoState = { status: "idle" | "success" | "error"; message?: string };

const OK: AccesoState = {
  status: "success",
  message:
    "Si tu correo está registrado como jugador, te enviamos un enlace para entrar (revisa también spam).",
};

export async function enviarEnlace(_prev: AccesoState, formData: FormData): Promise<AccesoState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Escribe un correo válido." };
  }

  const admin = createAdminClient();

  // Solo enviamos a jugadores ya aprobados (evita abuso y correos a desconocidos).
  const { data: player } = await admin
    .from("players")
    .select("id, estado")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();

  // Mensaje neutro siempre (no revelamos si el correo está registrado).
  if (!player || player.estado !== "aprobado") return OK;

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = `${proto}://${host}`;

  try {
    const { data } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${base}/jugador` },
    });
    const hashed = data?.properties?.hashed_token;
    if (hashed) {
      const link = `${base}/auth/confirm?token_hash=${hashed}&type=magiclink&next=/jugador`;
      await sendAccessLink(email, link);
    }
  } catch {
    // Mensaje neutro igualmente.
  }

  return OK;
}
