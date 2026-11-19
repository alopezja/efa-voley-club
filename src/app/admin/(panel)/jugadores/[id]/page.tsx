import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { getPlayerDetalle } from "@/lib/players";
import { getPlayerMemberships, getTeams, TIPO_LABEL } from "@/lib/teams";
import { getSchedules } from "@/lib/schedules";
import { AdminPlayerForm, type MembershipView } from "@/components/admin/admin-player-form";
import { agregarAEquipo, quitarDeEquipo } from "./edit-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ficha de jugador", robots: { index: false, follow: false } };

export default async function FichaJugadorPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePerm("jugadores");
  const { id } = await params;
  const p = await getPlayerDetalle(id);
  if (!p) notFound();

  const memberships = await getPlayerMemberships(id);
  const views: MembershipView[] = memberships.map((m) => ({
    teamId: m.team_id,
    nombre: m.team?.nombre ?? "Equipo",
    tipoLabel: m.team ? TIPO_LABEL[m.team.tipo] : "",
    numero: m.numero,
  }));

  const [schedules, teams] = await Promise.all([getSchedules(), getTeams()]);
  const diasSet = Array.from(new Set(schedules.map((s) => s.dia).filter(Boolean)));
  const dias = diasSet.length > 0 ? diasSet : ["Martes", "Viernes"];

  const idsActuales = new Set(memberships.map((m) => m.team_id));
  const disponibles = teams.filter((t) => !idsActuales.has(t.id));

  return (
    <div className="max-w-2xl">
      <Link href="/admin/jugadores" className="text-sm text-efa-ash hover:text-efa-bone">
        ← Volver a jugadores
      </Link>

      <div className="mb-8 mt-3 flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-efa-ash/20">
          {p.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.foto_url} alt={p.nombre} className="h-20 w-20 object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center font-display text-2xl text-efa-bone">
              {p.nombre.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl">
            {p.nombre} {p.apellido}
          </h1>
          <p className="text-sm text-efa-ash">
            Editar datos del jugador{p.estado ? ` · ${p.estado}` : ""}
          </p>
        </div>
      </div>

      {/* Equipos del jugador */}
      <section className="mb-8 rounded-lg border border-efa-ash/30 bg-efa-ink p-4">
        <h2 className="mb-3 text-xl text-efa-bone">Equipos</h2>
        {memberships.length === 0 ? (
          <p className="mb-3 text-sm text-efa-ash">No está en ningún equipo.</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {memberships.map((m) => (
              <li key={m.team_id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-efa-bone">
                  {m.team?.nombre ?? "Equipo"}{" "}
                  <span className="text-efa-ash">· {m.team ? TIPO_LABEL[m.team.tipo] : ""}</span>
                  {m.numero != null && <span className="text-efa-red"> · #{m.numero}</span>}
                </span>
                <form action={quitarDeEquipo}>
                  <input type="hidden" name="playerId" value={id} />
                  <input type="hidden" name="teamId" value={m.team_id} />
                  <button className="rounded-md border border-efa-ash/50 px-3 py-1.5 text-xs font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red">
                    Quitar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {disponibles.length > 0 ? (
          <form action={agregarAEquipo} className="flex items-end gap-2">
            <input type="hidden" name="playerId" value={id} />
            <div className="flex-1">
              <label className="mb-1 block text-xs text-efa-ash">Agregar a un equipo</label>
              <select
                name="teamId"
                required
                defaultValue=""
                className="w-full rounded-md border border-efa-ash/40 bg-efa-ink px-3 py-2 text-sm text-efa-bone focus:border-efa-red focus:outline-none"
              >
                <option value="" disabled>
                  Elige un equipo…
                </option>
                {disponibles.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} ({TIPO_LABEL[t.tipo]})
                  </option>
                ))}
              </select>
            </div>
            <button className="rounded-md bg-efa-red px-4 py-2 text-sm font-semibold text-efa-chalk hover:opacity-90">
              Agregar
            </button>
          </form>
        ) : (
          <p className="text-xs text-efa-ash">Ya está en todos los equipos existentes.</p>
        )}
      </section>

      <AdminPlayerForm player={p} memberships={views} dias={dias} />
    </div>
  );
}
