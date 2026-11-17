"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2, deleteFromR2, keyFromPublicUrl } from "@/lib/r2";
import { serverEnv } from "@/lib/env";
import { validatePhotoMeta, validateYoutube } from "@/lib/gallery-validation";

export type GalleryActionState = { status: "idle" | "success" | "error"; message?: string };

function revalidateGaleria() {
  revalidatePath("/galeria");
  revalidatePath("/admin/galeria");
}

export async function uploadPhoto(_prev: GalleryActionState, formData: FormData): Promise<GalleryActionState> {
  await requireAdmin();
  const file = formData.get("archivo");
  if (!(file instanceof File) || file.size === 0)
    return { status: "error", message: "Elige una imagen." };

  const check = validatePhotoMeta({ contentType: file.type, size: file.size });
  if (!check.ok) return { status: "error", message: Object.values(check.errors)[0] };

  const buffer = new Uint8Array(await file.arrayBuffer());
  let publicUrl: string;
  try {
    const res = await uploadToR2("galeria", file.name, file.type, buffer);
    publicUrl = res.publicUrl;
  } catch {
    return { status: "error", message: "No pudimos subir la imagen. Intenta de nuevo." };
  }

  const sb = await createClient();
  const { error } = await sb.from("gallery_items").insert({
    tipo: "foto",
    url: publicUrl,
    titulo: (formData.get("titulo") as string)?.trim() || null,
    descripcion: (formData.get("descripcion") as string)?.trim() || null,
    categoria: (formData.get("categoria") as string)?.trim() || null,
  });
  if (error) return { status: "error", message: "Se subió la imagen pero no se guardó. Intenta de nuevo." };

  revalidateGaleria();
  return { status: "success", message: "Foto agregada." };
}

export async function addYoutubeVideo(_prev: GalleryActionState, formData: FormData): Promise<GalleryActionState> {
  await requireAdmin();
  const enlace = (formData.get("enlace") as string) ?? "";
  const check = validateYoutube({ enlace });
  if (!check.ok) return { status: "error", message: Object.values(check.errors)[0] };

  const sb = await createClient();
  const { error } = await sb.from("gallery_items").insert({
    tipo: "video",
    enlace_youtube: `https://youtu.be/${check.id}`,
    titulo: (formData.get("titulo") as string)?.trim() || null,
    descripcion: (formData.get("descripcion") as string)?.trim() || null,
    categoria: (formData.get("categoria") as string)?.trim() || null,
  });
  if (error) return { status: "error", message: "No se pudo guardar el video. Intenta de nuevo." };

  revalidateGaleria();
  return { status: "success", message: "Video agregado." };
}

export async function deleteGalleryItem(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const sb = await createClient();
  const { data: row } = await sb.from("gallery_items").select("url").eq("id", id).maybeSingle();
  if (row?.url) {
    const key = keyFromPublicUrl(row.url, serverEnv().R2_PUBLIC_BASE_URL);
    if (key) {
      try {
        await deleteFromR2(key);
      } catch {
        /* best-effort: si falla el borrado en R2 igual quitamos la fila */
      }
    }
  }
  await sb.from("gallery_items").delete().eq("id", id);
  revalidateGaleria();
}
