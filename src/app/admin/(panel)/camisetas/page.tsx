import type { Metadata } from "next";
import { requirePerm } from "@/lib/auth";
import { getCamisetaReport, labelColor } from "@/lib/camisetas";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Camisetas", robots: { index: false, follow: false } };

const colorChip: Record<string, string> = {
  roja: "bg-efa-red/20 text-efa-red",
  negra: "bg-efa-ash/25 text-efa-bone",
  ambas: "bg-efa-ash/15 text-efa-bone",
};

export default async function AdminCamisetasPage() {
  await requirePerm("camisetas");
  const { items, totales, totalUnidades } = await getCamisetaReport();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-4xl">Pedido de camisetas</h1>
      <p className="mb-8 text-efa-ash">
        Consolidado de jugadores que quieren camiseta. &quot;Ambas&quot; cuenta una de cada color.
      </p>

      {items.length === 0 ? (
        <p className="text-efa-ash">Todavía ningún jugador ha pedido camiseta.</p>
      ) : (
        <div className="space-y-10">
          {/* Totales para el pedido */}
          <section>
            <h2 className="mb-3 text-2xl text-efa-bone">
              Para pedir <span className="text-base text-efa-ash">· {totalUnidades} unidades</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {totales.map((t) => (
                <span
                  key={`${t.color}-${t.talla}`}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${colorChip[t.color]}`}
                >
                  {labelColor(t.color)} {t.talla} × {t.cantidad}
                </span>
              ))}
            </div>
          </section>

          {/* Detalle por jugador */}
          <section>
            <h2 className="mb-3 text-2xl text-efa-bone">Detalle ({items.length})</h2>
            <div className="overflow-hidden rounded-lg border border-efa-ash/30">
              <table className="w-full text-left text-sm">
                <thead className="bg-efa-ink text-efa-ash">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Jugador</th>
                    <th className="px-4 py-2 font-semibold">Color</th>
                    <th className="px-4 py-2 font-semibold">Talla</th>
                    <th className="px-4 py-2 font-semibold">Apodo</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} className="border-t border-efa-ash/20">
                      <td className="px-4 py-2 text-efa-bone">{it.nombre}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${colorChip[it.color] ?? ""}`}>
                          {it.color === "ambas" ? "Ambas" : labelColor(it.color)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-efa-bone">{it.talla}</td>
                      <td className="px-4 py-2 text-efa-ash">{it.apodo || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
