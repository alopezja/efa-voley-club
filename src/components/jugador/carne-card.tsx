import { labelPosicion } from "@/lib/positions";
import { TIPO_LABEL, type TeamTipo } from "@/lib/teams-types";

export type CarneData = {
  nombre: string;
  fotoUrl: string | null;
  numero: number | null;
  equipo: string | null;
  tipo: string | null;
  posiciones: string[];
  experiencia: number | null;
  codigo: string; // id corto
};

export function CarneCard({ d }: { d: CarneData }) {
  const pos = d.posiciones.filter((p) => p !== "no_se").map(labelPosicion).join(" · ");

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-efa-red/40 bg-gradient-to-br from-efa-ink via-efa-ink to-[#2a0b0e] shadow-xl">
      {/* Encabezado */}
      <div className="flex items-center justify-between bg-efa-red px-5 py-3">
        <span className="font-display text-lg uppercase tracking-wide text-efa-chalk">EFA Voley Club</span>
        <span className="text-xs font-semibold uppercase text-efa-chalk/80">Carné</span>
      </div>

      {/* Cuerpo */}
      <div className="flex gap-5 p-5">
        <div className="relative shrink-0">
          <div className="h-28 w-28 overflow-hidden rounded-xl border-2 border-efa-red/50 bg-efa-ash/20">
            {d.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.fotoUrl} alt={d.nombre} className="h-28 w-28 object-cover" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center font-display text-4xl text-efa-bone">
                {d.nombre.charAt(0)}
              </div>
            )}
          </div>
          {d.numero != null && (
            <span className="absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-efa-ink bg-efa-red font-display text-xl text-efa-chalk">
              {d.numero}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-efa-ash">Jugador</p>
          <h2 className="font-display text-2xl leading-tight text-efa-bone">{d.nombre}</h2>
          <dl className="mt-3 space-y-1 text-sm">
            {d.equipo && (
              <div>
                <dt className="inline text-efa-ash">Equipo: </dt>
                <dd className="inline text-efa-bone">
                  {d.equipo}
                  {d.tipo ? ` (${TIPO_LABEL[d.tipo as TeamTipo] ?? d.tipo})` : ""}
                </dd>
              </div>
            )}
            {pos && (
              <div>
                <dt className="inline text-efa-ash">Posición: </dt>
                <dd className="inline text-efa-bone">{pos}</dd>
              </div>
            )}
            {d.experiencia != null && (
              <div>
                <dt className="inline text-efa-ash">Experiencia: </dt>
                <dd className="inline text-efa-bone">{d.experiencia}/10</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Pie */}
      <div className="flex items-center justify-between border-t border-efa-ash/20 px-5 py-3 text-xs text-efa-ash">
        <span>Eso Fue Adentro</span>
        <span className="font-mono uppercase">ID {d.codigo}</span>
      </div>
    </div>
  );
}
