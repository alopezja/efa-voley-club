import type { Convocatoria } from "@/lib/convocatorias";
import { googleCalendarUrl } from "@/lib/game-dates";

const TIPO_LABEL: Record<string, string> = {
  juego: "Juego",
  torneo: "Torneo",
  amistoso: "Amistoso",
};

function fechaLarga(iso: string): string {
  try {
    const s = new Intl.DateTimeFormat("es", { timeZone: "America/Bogota",
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
    return s.charAt(0).toUpperCase() + s.slice(1);
  } catch {
    return "";
  }
}

export function ConvocadoBanner({ convocatorias }: { convocatorias: Convocatoria[] }) {
  if (convocatorias.length === 0) return null;

  return (
    <div className="space-y-4">
      {convocatorias.map((c) => {
        const inicio = c.fecha_torneo ? new Date(c.fecha_torneo) : null;
        const calUrl =
          inicio &&
          googleCalendarUrl({
            titulo: c.titulo,
            inicio,
            fin: new Date(inicio.getTime() + 2 * 3600 * 1000),
            lugar: c.lugar,
            detalle: c.descripcion,
          });
        const comoLlegar = c.lugar
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.lugar)}`
          : null;

        return (
          <div
            key={c.id}
            className="overflow-hidden rounded-2xl border border-efa-red/60 bg-gradient-to-br from-efa-red/30 via-efa-ink to-efa-ink p-6 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="animate-pulse text-xl">📣</span>
              <span className="text-sm font-bold uppercase tracking-wide text-efa-red">
                ¡Estás convocado!
              </span>
              <span className="rounded-full bg-efa-red px-2 py-0.5 text-xs font-bold uppercase text-efa-chalk">
                {TIPO_LABEL[c.tipo] ?? c.tipo}
              </span>
            </div>

            <h2 className="mt-2 text-2xl text-efa-bone sm:text-3xl">{c.titulo}</h2>
            {inicio && <p className="mt-1 text-efa-bone/90">{fechaLarga(c.fecha_torneo!)}</p>}
            {c.lugar && <p className="text-sm text-efa-ash">{c.lugar}</p>}
            {c.categoria && <p className="text-sm text-efa-ash">Categoría: {c.categoria}</p>}
            {c.descripcion && (
              <p className="mt-2 line-clamp-3 text-sm text-efa-bone/80">{c.descripcion}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              {calUrl && (
                <a
                  href={calUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-efa-red px-4 py-2 text-sm font-semibold text-efa-chalk transition hover:opacity-90"
                >
                  Agregar a Google Calendar
                </a>
              )}
              {comoLlegar && (
                <a
                  href={comoLlegar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-efa-bone/40 px-4 py-2 text-sm font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red"
                >
                  Cómo llegar
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
