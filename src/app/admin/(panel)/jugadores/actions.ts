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

export async function approvePlayer(_prev: ApproveState, formData: FormData): Promise<ApproveState> {
  const { user } = await requirePerm("jugadores");
  const id = String(formData.get("id") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  if (!id) return { status: "error", message: "Falta el jugador." };
  if (!teamId) return { status: "error", message: "Elige un equipo para aprobar al jugador." };

  const admin = createAdminClient();

  // Datos del jugador
  const { data: player } = await admin
    .from("players")
    .select("id, nombre, apellido, email")
    .eq("id", id)
    .maybeSingle();
  if (!player) return { status: "error", message: "No se encontró el jugador." };

  // Aprobar
  const { error: updErr } = await admin
    .from("players")
    .update({ estado: "aprobado", aprobado_por: user.id, fecha_aprobacion: new Date().toISOString() })
    .eq("id", id);
  if (updErr) return { status: "error", message: "No se pudo aprobar." };

  // Asignar al equipo (si ya estaba, ignorar el conflicto)
  await admin.from("team_members").upsert(
    { team_id: teamId, player_id: id },
    { onConflict: "team_id,player_id", ignoreDuplicates: true }
  );

  // Nota: no revalidamos /admin/jugadores aquí para que la fila conserve el
  // mensaje y el enlace mágico de respaldo tras aprobar (se actualiza al recargar).
  revalidatePath("/admin");

  // Enlace mágico + correo (si tiene email)
  let magicLink: string | undefined;
  let emailEnviado = false;
  if (player.email) {
    try {
      const base = await origen();
      const { data } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email: player.email,
        options: { redirectTo: `${base}/jugador/perfil` },
      });
      // Flujo SSR: construimos un enlace a /auth/confirm con el token_hash.
      const hashed = data?.properties?.hashed_token;
      magicLink = hashed
        ? `${base}/auth/confirm?token_hash=${hashed}&type=magiclink&next=/jugador/perfil`
        : undefined;
      if (magicLink) {
        const r = await sendPlayerInvite(player.email, player.nombre, magicLink);
        emailEnviado = r.ok;
      }
    } catch {
      // Si falla la generación del enlace, igual quedó aprobado y asignado.
    }
  }

  return {
    status: "success",
    message: player.email
      ? emailEnviado
        ? "Aprobado. Correo con el enlace enviado al jugador."
        : "Aprobado. El correo no salió (dominio no verificado aún); copia el enlace de abajo."
      : "Aprobado. El jugador no tiene correo; comparte el enlace de abajo.",
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
