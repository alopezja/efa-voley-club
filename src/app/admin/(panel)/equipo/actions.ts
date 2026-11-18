"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SECCION_KEYS } from "@/lib/permisos";

const SUPER_EMAIL = "efavoleyclub@gmail.com";

export type EquipoState = { status: "idle" | "success" | "error"; message?: string };

function limpiarEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function esEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function guardarAdmin(_prev: EquipoState, formData: FormData): Promise<EquipoState> {
  await requireSuperAdmin();

  const email = limpiarEmail(String(formData.get("email") ?? ""));
  const permisos = formData
    .getAll("permisos")
    .map((p) => String(p))
    .filter((p) => (SECCION_KEYS as string[]).includes(p));

  if (!esEmail(email)) {
    return { status: "error", message: "Escribe un correo válido." };
  }
  if (email === SUPER_EMAIL) {
    return { status: "error", message: "Ese correo es el super administrador y no se edita aquí." };
  }
  if (permisos.length === 0) {
    return { status: "error", message: "Marca al menos una sección que podrá administrar." };
  }

  const admin = createAdminClient();

  // Registra/actualiza la invitación (fuente de verdad para quien aún no ha entrado).
  const { error: invErr } = await admin
    .from("admin_invites")
    .upsert({ email, rol: "admin", permisos }, { onConflict: "email" });
  if (invErr) {
    return { status: "error", message: "No se pudo guardar. Intenta de nuevo." };
  }

  // Si la persona ya tiene cuenta, aplica el cambio de inmediato.
  const { error: updErr } = await admin
    .from("profiles")
    .update({ role: "admin", permisos })
    .eq("email", email);
  if (updErr) {
    return { status: "error", message: "Se guardó la invitación, pero no se pudo actualizar su cuenta existente." };
  }

  revalidatePath("/admin/equipo");
  return { status: "success", message: `Permisos guardados para ${email}.` };
}

export async function quitarAdmin(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const email = limpiarEmail(String(formData.get("email") ?? ""));
  if (!email || email === SUPER_EMAIL) return;

  const admin = createAdminClient();
  await admin.from("admin_invites").delete().eq("email", email);
  // Si ya tenía cuenta, pasa a jugador (pierde acceso al panel).
  await admin.from("profiles").update({ role: "jugador", permisos: [] }).eq("email", email);

  revalidatePath("/admin/equipo");
}
