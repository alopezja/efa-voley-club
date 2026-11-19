import { labelPosicion } from "@/lib/positions";
import { TIPO_LABEL, type TeamTipo } from "@/lib/teams-types";

type Membership = { numero: number | null; team?: { nombre: string; tipo: string } };

export function ProfileReadyCard({
  nombre,
  fotoUrl,
  posiciones,
  memberships,
}: {
  nombre: string;
  fotoUrl: string | null;
  posiciones: string[];
  memberships: Membership[];
}) {
  const posLabels = (posiciones ?? []).filter((p) => p !== "no_se").map(labelPosicion);

  return (
    <div className="overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-efa-ink p-6">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        {/* Foto con anillo */}
        <div className="relative shrink-0">
          <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-green-400/80">
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoUrl} alt={nombre} className="h-24 w-24 object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center bg-efa-ash/20 font-display text-3xl text-efa-bone">
                {nombre.charAt(0)}
              </div>
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-efa-ink bg-green-400 text-sm font-bold text-efa-ink">
            ✓
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-300">
            Perfil completo
          </p>
          <h2 className="mt-0.5 text-2xl text-efa-bone sm:text-3xl">{nombre}</h2>
          <p className="mt-1 text-sm text-efa-ash">¡Listo para jugar! 🏐 Te avisaremos del próximo partido.</p>

          {/* Datos clave */}
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            {memberships.map((m, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-efa-ink px-3 py-1 text-sm text-efa-bone ring-1 ring-efa-ash/30"
              >
                {m.numero != null && <span className="font-display text-efa-red">#{m.numero}</span>}
                <span>{m.team?.nombre ?? "Equipo"}</span>
                {m.team && (
                  <span className="text-xs text-efa-ash">· {TIPO_LABEL[m.team.tipo as TeamTipo] ?? m.team.tipo}</span>
                )}
              </span>
            ))}
            {posLabels.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-efa-red/15 px-3 py-1 text-sm font-semibold text-efa-red ring-1 ring-efa-red/30">
                {posLabels.join(" · ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
