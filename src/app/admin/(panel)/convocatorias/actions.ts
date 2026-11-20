"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2, deleteFromR2, keyFromPublicUrl } from "@/lib/r2";
import { serverEnv } from "@/lib/env";
import { slugify } from "@/lib/slug";
import { validateConvocatoria } from "@/lib/convocatoria-validation";
import { syncConvocados } from "@/lib/convocados";
import { notifyPlayer } from "@/lib/notifications";
import { validatePhotoMeta } from "@/lib/gallery-validation";

export type ConvocatoriaState = {
  status: "idle" | "error";
  errors?: Record<string, string>;
  message?: string;
};

type SB = Awaited<ReturnType<typeof createClient>>;

async function uniqueSlug(sb: SB, titulo: string, excludeId: string | null) {
  const base = slugify(titulo) || "convocatoria";
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await sb.from("convocatorias").select("id").eq("slug", slug).maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

function revalidar(slug?: string) {
  revalidatePath("/convocatorias");
  revalidatePath("/admin/convocatorias");
  revalidatePath("/admin");
  revalidatePath("/");
  if (slug) revalidatePath(`/convocatorias/${slug}`);
}

export async function saveConvocatoria(
  _prev: ConvocatoriaState,
  formData: FormData
): Promise<ConvocatoriaState> {
  await requirePerm("convocatorias");
  const id = String(formData.get("id") ?? "") || null;

  const check = validateConvocatoria({
    titulo: String(formData.get("titulo") ?? ""),
    fecha_torneo: String(formData.get("fecha_torneo") ?? ""),
    lugar: String(formData.get("lugar") ?? ""),
    categoria: String(formData.get("categoria") ?? ""),
    descripcion: String(formData.get("descripcion") ?? ""),
    estado: String(formData.get("estado") ?? "borrador"),
  });
  if (!check.ok) return { status: "error", errors: check.errors };
  const v = check.values;

  const sb = await createClient();

  let imagen_portada_url = String(formData.get("imagen_actual") ?? "") || null;
  const file = formData.get("imagen");
  if (file instanceof File && file.size > 0) {
    const meta = validatePhotoMeta({ contentType: file.type, size: file.size });
    if (!meta.ok) return { status: "error", errors: { imagen: Object.values(meta.errors)[0] } };
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const res = await uploadToR2("convocatorias", file.name, file.type, buffer);
      imagen_portada_url = res.publicUrl;
    } catch {
      return { status: "error", message: "No pudimos subir la imagen. Intenta de nuevo." };
    }
  }

  let fechaIso: string | null = null;
  if (v.fecha_torneo) {
    const d = new Date(v.fecha_torneo);
    if (!Number.isNaN(d.getTime())) fechaIso = d.toISOString();
  }

  const tipoRaw = String(formData.get("tipo") ?? "juego");
  const tipo = ["juego", "torneo", "amistoso"].includes(tipoRaw) ? tipoRaw : "juego";

  const slug = await uniqueSlug(sb, v.titulo, id);
  const row = {
    titulo: v.titulo,
    slug,
    tipo,
    fecha_torneo: fechaIso,
    lugar: v.lugar || null,
    categoria: v.categoria || null,
    descripcion: v.descripcion || null,
    imagen_portada_url,
    estado: v.estado,
    updated_at: new Date().toISOString(),
  };

  const convocados = formData.getAll("convocados").map((x) => String(x));

  let convId = id;
  if (id) {
    const { error } = await sb.from("convocatorias").update(row).eq("id", id);
    if (error) return { status: "error", message: "No se pudo guardar. Intenta de nuevo." };
  } else {
    const { data, error } = await sb.from("convocatorias").insert(row).select("id").single();
    if (error || !data) return { status: "error", message: "No se pudo crear. Intenta de nuevo." };
    convId = data.id;
  }

  if (convId) {
    const nuevos = await syncConvocados(convId, convocados);
    const etiqueta = tipo === "torneo" ? "Torneo" : tipo === "amistoso" ? "Amistoso" : "Juego";
    const fechaTxt = fechaIso
      ? new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(fechaIso))
      : "";
    await Promise.all(
      nuevos.map((pid) =>
        notifyPlayer(pid, {
          tipo: "convocatoria",
          titulo: "¡Estás convocado! 📣",
          cuerpo: `${etiqueta}: ${v.titulo}${fechaTxt ? ` — ${fechaTxt}` : ""}`,
          url: "/jugador",
        })
      )
    );
  }

  revalidar(slug);
  redirect("/admin/convocatorias");
}

export async function deleteConvocatoria(formData: FormData) {
  await requirePerm("convocatorias");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = await createClient();
  const { data: row } = await sb
    .from("convocatorias")
    .select("imagen_portada_url")
    .eq("id", id)
    .maybeSingle();
  if (row?.imagen_portada_url) {
    const key = keyFromPublicUrl(row.imagen_portada_url, serverEnv().R2_PUBLIC_BASE_URL);
    if (key) {
      try {
        await deleteFromR2(key);
      } catch {
        /* best-effort */
      }
    }
  }
  await sb.from("convocatorias").delete().eq("id", id);
  revalidar();
}
