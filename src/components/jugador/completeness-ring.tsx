import type { Completeness } from "@/lib/profile-completeness";

export function CompletenessRing({
  completeness,
  mensaje,
}: {
  completeness: Completeness;
  mensaje: string;
}) {
  const { pct, items, done, total } = completeness;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const completo = pct >= 100;

  return (
    <div className="rounded-2xl border border-efa-ash/30 bg-efa-ink p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        {/* Anillo */}
        <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="12" className="text-efa-ash/20" />
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              className={completo ? "text-green-400" : "text-efa-red"}
              style={{ transition: "stroke-dashoffset .6s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl text-efa-bone">{pct}%</span>
            <span className="text-xs uppercase tracking-wide text-efa-ash">
              {done}/{total}
            </span>
          </div>
        </div>

        {/* Mensaje + checklist */}
        <div className="min-w-0 flex-1">
          <p className={`mb-3 text-lg font-semibold ${completo ? "text-green-300" : "text-efa-bone"}`}>
            {mensaje}
          </p>
          <ul className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
            {items.map((it) => (
              <li key={it.key} className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                    it.done ? "bg-green-500/20 text-green-300" : "bg-efa-ash/15 text-efa-ash"
                  }`}
                >
                  {it.done ? "✓" : "○"}
                </span>
                <span className={it.done ? "text-efa-bone" : "text-efa-ash"}>{it.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
