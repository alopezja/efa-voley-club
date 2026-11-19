import type { Metadata } from "next";
import { requirePerm } from "@/lib/auth";
import { getTeams } from "@/lib/teams";
import { EquiposManager } from "@/components/admin/equipos-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Equipos", robots: { index: false, follow: false } };

export default async function AdminEquiposPage() {
  await requirePerm("equipos");
  const teams = await getTeams();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-4xl">Equipos</h1>
      <p className="mb-8 text-efa-ash">
        Crea los equipos del club (entrenamiento u oficial). Al aprobar un jugador lo asignas a un
        equipo, y los números de camiseta se validan dentro de cada equipo.
      </p>
      <EquiposManager teams={teams} />
    </div>
  );
}
