import type { Metadata } from "next";
import { requirePerm } from "@/lib/auth";
import { getTeams, getTeamsConRoster, TIPO_LABEL } from "@/lib/teams";
import { labelPosicion } from "@/lib/positions";
import { EquiposManager } from "@/components/admin/equipos-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Equipos", robots: { index: false, follow: false } };

export default async function AdminEquiposPage() {
  await requirePerm("equipos");
  const [teams, rosters] = await Promise.all([getTeams(), getTeamsConRoster()]);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-4xl">Equipos</h1>
      <p className="mb-8 text-efa-ash">
        Crea los equipos del club (entrenamiento u oficial). Al aprobar un jugador lo asignas a un
        equipo, y los números de camiseta se validan dentro de cada equipo.
      </p>
      <EquiposManager teams={teams} />

      {rosters.some((r) => r.miembros.length > 0) && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl">Jugadores por equipo</h2>
          <div className="space-y-6">
            {rosters
              .filter((r) => r.miembros.length > 0)
              .map((r) => (
                <div key={r.id} className="rounded-lg border border-efa-ash/30 bg-efa-ink p-4">
                  <p className="mb-3 font-semibold text-efa-bone">
                    {r.nombre} <span className="text-sm text-efa-ash">· {TIPO_LABEL[r.tipo]}</span>
                  </p>
                  <ul className="space-y-1.5">
                    {r.miembros.map((m, i) => (
                      <li key={i} className="flex items-baseline gap-2 text-sm">
                        <span className="w-8 shrink-0 font-display text-efa-red">
                          {m.numero != null ? `#${m.numero}` : "—"}
                        </span>
                        <span className="text-efa-bone">
                          {m.nombre} {m.apellido}
                        </span>
                        <span className="text-efa-ash">
                          {m.posiciones.filter((p) => p !== "no_se").map(labelPosicion).join(", ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
