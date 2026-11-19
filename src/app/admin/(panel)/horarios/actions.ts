"use server";

import { revalidatePath } from "next/cache";
import { requirePerm } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type HorarioState = { status: "idle" | "success" | "error"; message?: string };

function fields(formData: FormData) {
  const tipoRaw = String(formData.get("tipo") ?? "entrenamiento");
  return {
    dia: String(formData.get("dia") ?? "").trim(),
    tipo: ["entrenamiento", "juego"].includes(tipoRaw) ? tipoRaw : "entrenamiento",
    horario: String(formData.get("horario") ?? "").trim() || null,
    lugar: String(formData.get("lugar") ?? "").trim() || null,
    descripcion: String(formData.get("descripcion") ?? "").trim() || null,
    maps_url: String(formData.get("maps_url") ?? "").trim() || null,
    orden: Number(formData.get("orden") ?? 0) || 0,
  };
}

// Los enlaces cortos de Maps (maps.app.goo.gl / goo.gl) no traen coordenadas.
// Al guardar, seguimos el redireccionamiento y guardamos el enlace completo
// (que sí trae @lat,lng) para que el mapa de la portada quede en el punto exacto.
async function resolveMapsUrl(url: string | null): Promise<string | null> {
  if (!url) return null;
  if (!/^https?:\/\/(maps\.app\.goo\.gl|goo\.gl)\//i.test(url)) return url;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (res.url && /google\.[^/]+\/maps/i.test(res.url) && /@-?\d+\.\d+,-?\d+\.\d+/.test(res.url)) {
      return res.url;
    }
  } catch {
    /* si falla, se guarda el enlace original */
  }
  return url;
}

function revalidar() {
  revalidatePath("/admin/horarios");
  revalidatePath("/");
}

export async function createSchedule(
  _prev: HorarioState,
  formData: FormData
): Promise<HorarioState> {
  await requirePerm("horarios");
  const data = fields(formData);
  if (!data.dia) return { status: "error", message: "Elige un día." };
  data.maps_url = await resolveMapsUrl(data.maps_url);
  const sb = await createClient();
  const { error } = await sb.from("schedules").insert(data);
  if (error) return { status: "error", message: "No se pudo agregar. Intenta de nuevo." };
  revalidar();
  return { status: "success", message: "Horario agregado ✓" };
}

export async function updateSchedule(
  _prev: HorarioState,
  formData: FormData
): Promise<HorarioState> {
  await requirePerm("horarios");
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Falta el identificador." };
  const data = fields(formData);
  if (!data.dia) return { status: "error", message: "Elige un día." };
  data.maps_url = await resolveMapsUrl(data.maps_url);
  const sb = await createClient();
  const { error } = await sb.from("schedules").update(data).eq("id", id);
  if (error) return { status: "error", message: "No se pudo guardar. Intenta de nuevo." };
  revalidar();
  return { status: "success", message: "Guardado ✓" };
}

export async function deleteSchedule(formData: FormData) {
  await requirePerm("horarios");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = await createClient();
  await sb.from("schedules").delete().eq("id", id);
  revalidar();
}
