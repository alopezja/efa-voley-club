"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requirePerm } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPlayerInvite } from "@/lib/email";

export type ApproveState = {
  status: "idle" | "success" | "error";
  message?: string;
  magicLink?: string;
  emailEnviado?: boolean;
};

async function origen(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

type AdminSb = ReturnType<typeof createAdminClient>;

// Genera el enlace mágico (flujo SSR con token_hash) y lo envía por correo.
async function generarEnlace(
  admin: AdminSb,
  email: string,
  nombre: string,
  base: string
): Promise<{ magicLink?: string; emailEnviado: boolean }> {
  try {
    const { data } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${base}/jugador/perfil` },
    });
    const hashed = data?.properties?.hashed_token;
    const magicLink = hashed
      ? `${base}/auth/confirm?token_hash=${hashed}&type=magiclink&next=/jugador/perfil`
      : undefined;
    let emailEnviado = false;
    if (magicLink) {
      const r = await sendPlayerInvite(email, nombre, magicLink);
      emailEnviado = r.ok;
    }
    return { magicLink, emailEnviado };
  } catch {
    return { emailEnviado: false };
  }
}

export async function approvePlayer(_prev: ApproveState, formData: FormData): Promise<ApproveState> {
  const { user } = await requirePerm("jugadores");
  const id = String(formData.get("id") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  if (!id) return { status: "error", message: "Falta el jugador." };
  if (!teamId) return { status: "error", message: "Elige un equipo para aprobar al jugador." };

  const admin = createAdminClient();

  const { data: player } = await admin
    .from("players")
    .select("id, nombre, apellido, email")
    .eq("id", id)
    .maybeSingle();
  if (!player) return { status: "error", message: "No se encontró el jugador." };

  const { error: updErr } = await admin
    .from("players")
    .update({ estado: "aprobado", aprobado_por: user.id, fecha_aprobacion: new Date().toISOString() })
    .eq("id", id);
  if (updErr) return { status: "error", message: "No se pudo aprobar." };

  await admin
    .from("team_members")
    .upsert({ team_id: teamId, player_id: id }, { onConflict: "team_id,player_id", ignoreDuplicates: true });

  // No revalidamos /admin/jugadores aquí para conservar el mensaje y el enlace de respaldo.
  revalidatePath("/admin");

  let magicLink: string | undefined;
  let emailEnviado = false;
  if (player.email) {
    const base = await origen();
    const r = await generarEnlace(admin, player.email, player.nombre, base);
    magicLink = r.magicLink;
    emailEnviado = r.emailEnviado;
  }

  return {
    status: "success",
    message: player.email
      ? emailEnviado
        ? "Aprobado. Correo con el enlace enviado al jugador."
        : "Aprobado. El correo no salió; copia el enlace de abajo."
      : "Aprobado. El jugador no tiene correo; comparte el enlace de abajo.",
    magicLink,
    emailEnviado,
  };
}

// Reenvía (o envía por primera vez) el enlace a un jugador ya aprobado.
// Opcionalmente lo asigna a un equipo si aún no tiene uno.
export async function reenviarEnlace(_prev: ApproveState, formData: FormData): Promise<ApproveState> {
  await requirePerm("jugadores");
  const id = String(formData.get("id") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  if (!id) return { status: "error", message: "Falta el jugador." };

  const admin = createAdminClient();
  const { data: player } = await admin
    .from("players")
    .select("id, nombre, apellido, email")
    .eq("id", id)
    .maybeSingle();
  if (!player) return { status: "error", message: "No se encontró el jugador." };
  if (!player.email) return { status: "error", message: "Este jugador no tiene correo; no se le puede enviar enlace." };

  if (teamId) {
    await admin
      .from("team_members")
      .upsert({ team_id: teamId, player_id: id }, { onConflict: "team_id,player_id", ignoreDuplicates: true });
  }

  const base = await origen();
  const { magicLink, emailEnviado } = await generarEnlace(admin, player.email, player.nombre, base);
  revalidatePath("/admin");

  return {
    status: "success",
    message: emailEnviado
      ? `Enlace enviado a ${player.email}.`
      : "No se pudo enviar el correo; copia el enlace de abajo.",
    magicLink,
    emailEnviado,
  };
}

export async function rejectPlayer(formData: FormData) {
  const { user } = await requirePerm("jugadores");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = await createClient();
  await sb
    .from("players")
    .update({ estado: "rechazado", aprobado_por: user.id, fecha_aprobacion: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/jugadores");
  revalidatePath("/admin");
}
