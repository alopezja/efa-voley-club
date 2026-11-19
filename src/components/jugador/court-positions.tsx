"use client";

import { useState } from "react";

type Spot = { key: string; label: string; x: number; y: number };

// Acomodo balanceado en media cancha (red arriba): 3 adelante, 2 atrás centradas.
const SPOTS: Spot[] = [
  { key: "punta", label: "Punta", x: 80, y: 96 },
  { key: "central", label: "Central", x: 160, y: 96 },
  { key: "opuesto", label: "Opuesto", x: 240, y: 96 },
  { key: "libero", label: "Líbero", x: 120, y: 216 },
  { key: "armador", label: "Armador", x: 200, y: 216 },
];

export function CourtPositions({ defaultValue }: { defaultValue: string[] }) {
  const [sel, setSel] = useState<string[]>(defaultValue ?? []);

  function toggle(key: string) {
    setSel((prev) => {
      if (key === "no_se") return prev.includes("no_se") ? [] : ["no_se"];
      const base = prev.filter((k) => k !== "no_se");
      if (base.includes(key)) return base.filter((k) => k !== key);
      if (base.length >= 2) return base;
      return [...base, key];
    });
  }

  const noSe = sel.includes("no_se");
  const elegidas = sel.filter((k) => k !== "no_se");
  const nombres = SPOTS.filter((s) => elegidas.includes(s.key)).map((s) => s.label);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm font-semibold text-efa-bone">Posición</p>
        <p className="text-xs text-efa-ash">
          {noSe ? "Sin definir" : `${elegidas.length}/2 · toca la cancha`}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-efa-ash/30 bg-gradient-to-b from-[#17130f] to-efa-ink p-4">
        <svg viewBox="0 0 320 300" className="h-auto w-full" role="group" aria-label="Cancha de vóley">
          <defs>
            <linearGradient id="court" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#201a14" />
              <stop offset="1" stopColor="#141210" />
            </linearGradient>
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#d81f26" floodOpacity="0.55" />
            </filter>
          </defs>

          {/* Superficie de la cancha */}
          <rect x="20" y="20" width="280" height="260" rx="10" fill="url(#court)" stroke="#f2ece1" strokeOpacity="0.5" strokeWidth="2" />

          {/* Red (arriba) con postes */}
          <line x1="20" y1="20" x2="300" y2="20" stroke="#f2ece1" strokeWidth="5" strokeDasharray="7 5" strokeOpacity="0.9" />
          <circle cx="20" cy="20" r="4" fill="#f2ece1" />
          <circle cx="300" cy="20" r="4" fill="#f2ece1" />

          {/* Líneas de zonas (3 columnas) */}
          <line x1="113" y1="20" x2="113" y2="280" stroke="#f2ece1" strokeOpacity="0.14" strokeWidth="1.5" />
          <line x1="207" y1="20" x2="207" y2="280" stroke="#f2ece1" strokeOpacity="0.14" strokeWidth="1.5" />
          {/* Línea de ataque (3 metros) */}
          <line x1="20" y1="150" x2="300" y2="150" stroke="#f2ece1" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="6 5" />

          {SPOTS.map((s) => {
            const active = elegidas.includes(s.key);
            return (
              <g
                key={s.key}
                onClick={() => toggle(s.key)}
                style={{ cursor: noSe ? "not-allowed" : "pointer" }}
                opacity={noSe ? 0.35 : 1}
                className="group"
              >
                {/* área táctil */}
                <circle cx={s.x} cy={s.y} r="36" fill="transparent" />
                <circle
                  cx={s.x}
                  cy={s.y}
                  r="33"
                  fill={active ? "#d81f26" : "#0e0e0f"}
                  stroke="currentColor"
                  strokeWidth={active ? 2.5 : 2}
                  filter={active ? "url(#glow)" : undefined}
                  className={
                    active
                      ? "text-efa-red"
                      : "text-efa-ash/60 transition-colors group-hover:text-efa-red"
                  }
                />
                <text
                  x={s.x}
                  y={active ? s.y - 1 : s.y + 4}
                  textAnchor="middle"
                  fontSize="12.5"
                  fontWeight="700"
                  fill={active ? "#f2ece1" : "#d6d0c4"}
                >
                  {s.label}
                </text>
                {active && (
                  <text x={s.x} y={s.y + 15} textAnchor="middle" fontSize="11" fill="#f2ece1" fillOpacity="0.9">
                    ✓
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Resumen + "no sé" */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-efa-ash">
          {noSe
            ? "Marcaste: aún no sé mi posición."
            : nombres.length
              ? `Elegiste: ${nombres.join(" y ")}.`
              : "Elige 1 o 2 posiciones."}
        </p>
        <button
          type="button"
          onClick={() => toggle("no_se")}
          className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
            noSe
              ? "border-efa-red bg-efa-red/15 text-efa-red"
              : "border-efa-ash/40 text-efa-bone hover:border-efa-red"
          }`}
        >
          Aún no sé
        </button>
      </div>

      {sel.map((k) => (
        <input key={k} type="hidden" name="posiciones" value={k} />
      ))}
    </div>
  );
}
