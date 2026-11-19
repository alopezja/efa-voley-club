import type { Logro } from "@/lib/logros";

export function LogrosStrip({ logros }: { logros: Logro[] }) {
  const conseguidos = logros.filter((l) => l.conseguido).length;

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-2xl text-efa-bone">Mis logros</h2>
        <span className="text-sm text-efa-ash">
          {conseguidos}/{logros.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {logros.map((l) => (
          <div
            key={l.key}
            title={l.descripcion}
            className={`rounded-xl border p-3 text-center transition ${
              l.conseguido
                ? "border-efa-red/40 bg-efa-red/10"
                : "border-efa-ash/20 bg-efa-ink opacity-50"
            }`}
          >
            <div className={`text-3xl ${l.conseguido ? "" : "grayscale"}`}>{l.conseguido ? l.icono : "🔒"}</div>
            <p className="mt-1 text-xs font-semibold text-efa-bone">{l.titulo}</p>
            <p className="mt-0.5 text-[11px] leading-tight text-efa-ash">{l.descripcion}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
