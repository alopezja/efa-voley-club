import { createClient } from "@/lib/supabase/server";

export type CamisetaItem = {
  nombre: string;
  color: string; // roja | negra | ambas
  talla: string;
  apodo: string | null;
};

export type TotalLinea = { color: "roja" | "negra"; talla: string; cantidad: number };

export type CamisetaReport = {
  items: CamisetaItem[];
  totales: TotalLinea[];
  totalUnidades: number;
};

const TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];
const COLOR_LABEL: Record<string, string> = { roja: "Roja", negra: "Negra" };

export function labelColor(c: string): string {
  return COLOR_LABEL[c] ?? c;
}

export async function getCamisetaReport(): Promise<CamisetaReport> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("players")
      .select("nombre,apellido,camiseta_color,camiseta_talla,apodo")
      .eq("estado", "aprobado")
      .eq("quiere_camiseta", true);

    const items: CamisetaItem[] = [];
    // conteo por color (roja/negra) × talla; "ambas" suma a las dos.
    const conteo = new Map<string, number>();
    const add = (color: "roja" | "negra", talla: string) => {
      const k = `${color}|${talla}`;
      conteo.set(k, (conteo.get(k) ?? 0) + 1);
    };

    for (const p of data ?? []) {
      const color = String(p.camiseta_color ?? "");
      const talla = String(p.camiseta_talla ?? "");
      if (!talla) continue;
      items.push({
        nombre: `${p.nombre} ${p.apellido}`.trim(),
        color,
        talla,
        apodo: p.apodo ?? null,
      });
      if (color === "ambas") {
        add("roja", talla);
        add("negra", talla);
      } else if (color === "roja" || color === "negra") {
        add(color, talla);
      }
    }

    const totales: TotalLinea[] = [];
    for (const color of ["roja", "negra"] as const) {
      for (const talla of TALLAS) {
        const cantidad = conteo.get(`${color}|${talla}`) ?? 0;
        if (cantidad > 0) totales.push({ color, talla, cantidad });
      }
    }
    const totalUnidades = totales.reduce((s, t) => s + t.cantidad, 0);

    items.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return { items, totales, totalUnidades };
  } catch {
    return { items: [], totales: [], totalUnidades: 0 };
  }
}
