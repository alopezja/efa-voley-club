import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getPlayers, type Player } from "@/lib/players";
import { approvePlayer, rejectPlayer } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Jugadores", robots: { index: false, follow: false } };

const estadoStyle: Record<string, string> = {
  pendiente: "bg-yellow-500/20 text-yellow-300",
  aprobado: "bg-green-500/20 text-green-300",
  rechazado: "bg-efa-red/20 text-efa-red",
};

function Fila({ p }: { p: Player }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-efa-ash/30 bg-efa-ink p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-semibold text-efa-bone">
          {p.nombre} {p.apellido}
        </p>
        <p className="text-sm text-efa-ash">
          {p.categoria ?? "Sin categoría"}
          {p.email ? ` · ${p.email}` : ""}
          {p.telefono ? ` · ${p.telefono}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${estadoStyle[p.estado] ?? ""}`}>
          {p.estado}
        </span>
        {p.estado !== "aprobado" && (
          <form action={approvePlayer}>
            <input type="hidden" name="id" value={p.id} />
            <button className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:opacity-90">
              Aprobar
            </button>
          </form>
        )}
        {p.estado !== "rechazado" && (
          <form action={rejectPlayer}>
            <input type="hidden" name="id" value={p.id} />
            <button className="rounded-md border border-efa-ash/50 px-3 py-2 text-sm font-semibold text-efa-bone hover:border-efa-red hover:text-efa-red">
              Rechazar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default async function AdminJugadoresPage() {
  await requireAdmin();
  const players = await getPlayers();
  const pendientes = players.filter((p) => p.estado === "pendiente");
  const resto = players.filter((p) => p.estado !== "pendiente");

  return (
    <div>
      <h1 className="mb-8 text-4xl">Jugadores</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl text-efa-bone">Pendientes ({pendientes.length})</h2>
        {pendientes.length === 0 ? (
          <p className="text-efa-ash">No hay registros pendientes.</p>
        ) : (
          <div className="space-y-3">{pendientes.map((p) => <Fila key={p.id} p={p} />)}</div>
        )}
      </section>

      {resto.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl text-efa-bone">Revisados ({resto.length})</h2>
          <div className="space-y-3">{resto.map((p) => <Fila key={p.id} p={p} />)}</div>
        </section>
      )}
    </div>
  );
}
