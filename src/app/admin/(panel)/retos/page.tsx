import type { Metadata } from "next";
import { requirePerm } from "@/lib/auth";
import { getChallenges, type Challenge } from "@/lib/challenges";
import { markChallengeRead, deleteChallenge } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Retos", robots: { index: false, follow: false } };

function Tarjeta({ c }: { c: Challenge }) {
  return (
    <div
      className={`rounded-lg border p-4 ${c.leido ? "border-efa-ash/20 bg-efa-ink/60" : "border-efa-red/50 bg-efa-ink"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-efa-bone">
            {c.nombre}
            {c.equipo ? ` · ${c.equipo}` : ""}
          </p>
          {c.categoria && (
            <span className="mt-1 inline-block rounded-full bg-efa-bone/10 px-3 py-0.5 text-xs font-semibold uppercase text-efa-bone">
              {c.categoria}
            </span>
          )}
          <p className="mt-1 text-sm text-efa-ash">
            {[c.email, c.telefono].filter(Boolean).join(" · ") || "Sin contacto"}
          </p>
        </div>
        {!c.leido && (
          <span className="rounded-full bg-efa-red px-3 py-1 text-xs font-semibold uppercase text-efa-chalk">
            Nuevo
          </span>
        )}
      </div>

      {(c.fecha_propuesta || c.lugar) && (
        <p className="mt-3 text-sm text-efa-bone">
          {c.fecha_propuesta ? `📅 ${c.fecha_propuesta}` : ""} {c.lugar ? `📍 ${c.lugar}` : ""}
        </p>
      )}
      {c.mensaje && <p className="mt-2 whitespace-pre-line text-efa-ash">{c.mensaje}</p>}

      <div className="mt-4 flex items-center gap-3">
        {!c.leido && (
          <form action={markChallengeRead}>
            <input type="hidden" name="id" value={c.id} />
            <button className="rounded-md bg-efa-bone px-3 py-2 text-sm font-semibold text-efa-ink hover:opacity-90">
              Marcar como leído
            </button>
          </form>
        )}
        <form action={deleteChallenge}>
          <input type="hidden" name="id" value={c.id} />
          <button className="text-sm font-semibold text-efa-red hover:underline">Borrar</button>
        </form>
      </div>
    </div>
  );
}

export default async function AdminRetosPage() {
  await requirePerm("retos");
  const challenges = await getChallenges();
  const nuevos = challenges.filter((c) => !c.leido);

  return (
    <div>
      <h1 className="mb-2 text-4xl">Retos</h1>
      <p className="mb-8 text-efa-ash">{nuevos.length} sin leer · {challenges.length} en total</p>

      {challenges.length === 0 ? (
        <p className="text-efa-ash">Aún no hay retos. Cuando alguien rete al club, aparecerá aquí.</p>
      ) : (
        <div className="space-y-4">{challenges.map((c) => <Tarjeta key={c.id} c={c} />)}</div>
      )}
    </div>
  );
}
