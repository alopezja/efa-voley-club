import { requireJugador } from "@/lib/auth";
import { getMiPlayer, linkPlayerByEmail } from "@/lib/player-profile";
import { getMisEquiposRoster, type Companero } from "@/lib/comunidad";
import { labelPosicion } from "@/lib/positions";
import { TIPO_LABEL, type TeamTipo } from "@/lib/teams-types";

export const dynamic = "force-dynamic";

function Avatar({ c }: { c: Companero }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-efa-ash/30 bg-efa-ink p-3">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-efa-ash/20">
        {c.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.foto_url} alt={c.nombre} className="h-12 w-12 object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center font-display text-lg text-efa-bone">
            {c.nombre.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-efa-bone">
          {c.numero != null && <span className="text-efa-red">#{c.numero} </span>}
          {c.nombre} {c.apellido}
        </p>
        <p className="truncate text-xs text-efa-ash">
          {c.posiciones.filter((p) => p !== "no_se").map(labelPosicion).join(" · ") || "Sin posición"}
        </p>
      </div>
    </div>
  );
}

export default async function JugadorEquipoPage() {
  const { user } = await requireJugador();
  await linkPlayerByEmail(user.id, user.email);
  const player = await getMiPlayer(user.id);
  const equipos = player ? await getMisEquiposRoster(player.id) : [];

  return (
    <div>
      <h1 className="mb-2 text-3xl sm:text-4xl">Mi equipo</h1>
      <p className="mb-8 text-efa-ash">Tus compañeros de equipo.</p>

      {equipos.length === 0 ? (
        <p className="text-efa-ash">Aún no estás asignado a un equipo. El club te asignará pronto.</p>
      ) : (
        <div className="space-y-8">
          {equipos.map((e) => (
            <section key={e.teamId}>
              <h2 className="mb-3 text-2xl text-efa-bone">
                {e.nombre}{" "}
                <span className="text-sm text-efa-ash">· {TIPO_LABEL[e.tipo as TeamTipo] ?? e.tipo}</span>
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {e.miembros.map((c) => (
                  <Avatar key={c.id} c={c} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
