import type { Metadata } from "next";
import { requirePerm } from "@/lib/auth";
import { getUpcomingGames, getAsistenciasAdmin, type ConfirmRef } from "@/lib/games";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Asistencias", robots: { index: false, follow: false } };

const ZONA: Record<string, string> = {
  tobillo: "Tobillo",
  rodilla: "Rodilla",
  hombro: "Hombro",
  dedo: "Dedo/muñeca",
  espalda: "Espalda",
  otro: "Otro",
};
const NIVEL: Record<string, string> = {
  leve: "Molestia leve",
  lesion: "Lesión",
  no_juego: "No puede jugar",
};

function molestiaTexto(r: ConfirmRef): string | null {
  const partes = [r.molestiaZona ? ZONA[r.molestiaZona] : null, r.molestiaNivel ? NIVEL[r.molestiaNivel] : null]
    .filter(Boolean)
    .join(" · ");
  const extra = [partes, r.molestiaNota].filter(Boolean).join(" — ");
  return extra || null;
}

function fechaLabel(fecha: string): string {
  const d = new Date(`${fecha}T12:00:00-05:00`);
  const s = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function AdminAsistenciasPage() {
  await requirePerm("asistencias");
  const games = await getUpcomingGames(6);
  const confirmaciones = await getAsistenciasAdmin(games);

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-4xl">Asistencias</h1>
      <p className="mb-8 text-efa-ash">Quién confirmó para los próximos juegos.</p>

      {games.length === 0 ? (
        <p className="text-efa-ash">No hay juegos programados.</p>
      ) : (
        <div className="space-y-5">
          {games.map((g) => {
            const c = confirmaciones[g.key] ?? { voy: [], no_voy: [] };
            return (
              <div key={g.key} className="rounded-lg border border-efa-ash/30 bg-efa-ink p-4">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="rounded bg-efa-red/15 px-2 py-0.5 text-xs font-semibold uppercase text-efa-red">
                      {g.tipo === "entreno" ? "Entreno" : "Convocatoria"}
                    </span>
                    <p className="mt-1 font-semibold text-efa-bone">{g.titulo}</p>
                    <p className="text-sm text-efa-ash">
                      {fechaLabel(g.fecha)}
                      {g.lugar ? ` · ${g.lugar}` : ""}
                    </p>
                  </div>
                  <div className="text-sm text-efa-ash">
                    <span className="font-semibold text-green-400">{c.voy.length} van</span> ·{" "}
                    <span className="font-semibold text-efa-red">{c.no_voy.length} no</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-green-400">Van ({c.voy.length})</p>
                    {c.voy.length === 0 ? (
                      <p className="text-sm text-efa-ash">—</p>
                    ) : (
                      <ul className="space-y-1 text-sm text-efa-bone">
                        {c.voy.map((r, i) => (
                          <li key={i}>{r.nombre}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-efa-red">No van ({c.no_voy.length})</p>
                    {c.no_voy.length === 0 ? (
                      <p className="text-sm text-efa-ash">—</p>
                    ) : (
                      <ul className="space-y-1 text-sm text-efa-bone">
                        {c.no_voy.map((r, i) => {
                          const m = molestiaTexto(r);
                          return (
                            <li key={i}>
                              {r.nombre}
                              {m && <span className="text-efa-ash"> — {m}</span>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
