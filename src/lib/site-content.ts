import { createClient } from "@/lib/supabase/server";

const FALLBACKS: Record<string, string> = {
  nosotros_titulo: "Sobre EFA Voley Club",
  nosotros_cuerpo: "Eso Fue Adentro nace de la pasión por el vóley. Formamos dentro y fuera de la cancha.",
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
