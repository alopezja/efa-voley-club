"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  return {
    dia: String(formData.get("dia") ?? "").trim(),
    horario: String(formData.get("horario") ?? "").trim() || null,
    lugar: String(formData.get("lugar") ?? "").trim() || null,
    descripcion: String(formData.get("descripcion") ?? "").trim() || null,
    maps_url: String(formData.get("maps_url") ?? "").trim() || null,
    orden: Number(formData.get("orden") ?? 0) || 0,
  };
}

function revalidar() {
  revalidatePath("/admin/horarios");
  revalidatePath("/");
}

export async function createSchedule(formData: FormData) {
  await requireAdmin();
  const data = fields(formData);
  if (!data.dia) return;
  const sb = await createClient();
  await sb.from("schedules").insert(data);
  revalidar();
}

export async function updateSchedule(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const data = fields(formData);
  if (!data.dia) return;
  const sb = await createClient();
  await sb.from("schedules").update(data).eq("id", id);
  revalidar();
}

export async function deleteSchedule(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = await createClient();
  await sb.from("schedules").delete().eq("id", id);
  revalidar();
}
