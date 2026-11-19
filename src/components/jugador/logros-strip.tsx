import type { Logro } from "@/lib/logros";

// Tarjeta compacta (vertical) pensada para la barra lateral del portal.
export function LogrosStrip({ logros }: { logros: Logro[] }) {
  const conseguidos = logros.filter((l) => l.conseguido).length;

  return (
    <section className="rounded-2xl border border-efa-ash/30 bg-efa-ink p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl text-efa-bone">Mis logros</h2>
        <span className="text-sm font-semibold text-efa-red">
          {conseguidos}/{logros.length}
        </span>
      </div>
      <ul className="space-y-2">
        {logros.map((l) => (
          <li
            key={l.key}
            className={`flex items-center gap-3 rounded-lg border p-2.5 ${
              l.conseguido ? "border-efa-red/40 bg-efa-red/10" : "border-efa-ash/15 opacity-60"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-efa-ink text-lg">
              {l.conseguido ? l.icono : "🔒"}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-efa-bone">{l.titulo}</p>
              <p className="truncate text-xs text-efa-ash">{l.descripcion}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
