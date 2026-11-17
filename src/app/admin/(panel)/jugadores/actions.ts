"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PlayerStatus } from "@/lib/players";

async function setEstado(id: string, estado: PlayerStatus) {
  const { user } = await requireAdmin();
  if (!id) return;
  const sb = await createClient();
  await sb
    .from("players")
    .update({ estado, aprobado_por: user.id, fecha_aprobacion: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/jugadores");
  revalidatePath("/admin");
}

export async function approvePlayer(formData: FormData) {
  await setEstado(String(formData.get("id") ?? ""), "aprobado");
}

export async function rejectPlayer(formData: FormData) {
  await setEstado(String(formData.get("id") ?? ""), "rechazado");
}
