import { createClient } from "@/lib/supabase/server";

const FALLBACKS: Record<string, string> = {
  nosotros_titulo: "Sobre EFA Voley Club",
  nosotros_cuerpo:
    "Eso Fue Adentro nació como un club de la comunidad, para quienes quieren jugar vóley por el simple gusto de jugar. Creemos que practicar deporte no debería tener edad: por eso abrimos la cancha tanto a jóvenes como a adultos que no encuentran dónde jugar. Aquí no exigimos alto rendimiento; buscamos movernos, compartir y disfrutar este deporte en comunidad.",
};

export async function getSiteContent(keys: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = FALLBACKS[k] ?? "";
  try {
    const sb = await createClient();
    const { data } = await sb.from("site_content").select("key,value").in("key", keys);
    for (const row of data ?? []) if (row.value) out[row.key] = row.value;
  } catch {
    // Si Supabase no responde, se usan los fallbacks.
  }
  return out;
}
