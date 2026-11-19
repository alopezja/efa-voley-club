"use server";

import { revalidatePath } from "next/cache";
import { requirePerm } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EquipoState = { status: "idle" | "success" | "error"; message?: string };

const TIPOS = ["entrenamiento", "oficial"];

export async function crearEquipo(_prev: EquipoState, formData: FormData): Promise<EquipoState> {
  await requirePerm("equipos");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "");

  if (nombre.length < 2) return { status: "error", message: "Escribe un nombre de equipo." };
  if (!TIPOS.includes(tipo)) return { status: "error", message: "Elige el tipo de equipo." };

  const sb = await createClient();
  const { error } = await sb.from("teams").insert({ nombre, tipo });
  if (error) return { status: "error", message: "No se pudo crear el equipo." };

  revalidatePath("/admin/equipos");
  return { status: "success", message: `Equipo "${nombre}" creado.` };
}

export async function eliminarEquipo(formData: FormData): Promise<void> {
  await requirePerm("equipos");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = await createClient();
  await sb.from("teams").delete().eq("id", id);
  revalidatePath("/admin/equipos");
}
