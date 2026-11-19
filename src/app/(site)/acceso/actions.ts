"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAccessLink } from "@/lib/email";

export type AccesoState = { status: "idle" | "success" | "error"; message?: string };

const SUPER_EMAIL = "efavoleyclub@gmail.com";

const OK: AccesoState = {
  status: "success",
  message:
    "Si tu correo está registrado, te enviamos un enlace para entrar (revisa también spam).",
};

export async function enviarEnlace(_prev: AccesoState, formData: FormData): Promise<AccesoState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Escribe un correo válido." };
  }

  const admin = createAdminClient();

  // Enviamos solo a cuentas conocidas (evita abuso): jugador aprobado, admin, o super admin.
  const [{ data: player }, { data: perfil }] = await Promise.all([
    admin.from("players").select("estado").ilike("email", email).limit(1).maybeSingle(),
    admin.from("profiles").select("role").ilike("email", email).limit(1).maybeSingle(),
  ]);
  const esJugadorAprobado = player?.estado === "aprobado";
  const esAdmin = perfil?.role === "admin" || perfil?.role === "super_admin";
  const esSuper = email === SUPER_EMAIL;

  // Mensaje neutro siempre (no revelamos si el correo está registrado).
  if (!esJugadorAprobado && !esAdmin && !esSuper) return OK;

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = `${proto}://${host}`;

  try {
    const { data } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${base}/auth/callback` },
    });
    const hashed = data?.properties?.hashed_token;
    if (hashed) {
      // Sin `next`: /auth/confirm detecta el rol y envía a /admin o /jugador.
      const link = `${base}/auth/confirm?token_hash=${hashed}&type=magiclink`;
      await sendAccessLink(email, link);
    }
  } catch {
    // Mensaje neutro igualmente.
  }

  return OK;
}
