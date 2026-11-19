"use client";

import { useState } from "react";

type Spot = { key: string; label: string; x: number; y: number };

// Posiciones ubicadas en zonas representativas de media cancha (red arriba).
const SPOTS: Spot[] = [
  { key: "punta", label: "Punta", x: 80, y: 78 },
  { key: "central", label: "Central", x: 150, y: 78 },
  { key: "opuesto", label: "Opuesto", x: 220, y: 78 },
  { key: "libero", label: "Líbero", x: 150, y: 190 },
  { key: "armador", label: "Armador", x: 220, y: 190 },
];

export function CourtPositions({ defaultValue }: { defaultValue: string[] }) {
  const [sel, setSel] = useState<string[]>(defaultValue ?? []);

  function toggle(key: string) {
    setSel((prev) => {
      if (key === "no_se") return prev.includes("no_se") ? [] : ["no_se"];
      const base = prev.filter((k) => k !== "no_se");
      if (base.includes(key)) return base.filter((k) => k !== key);
      if (base.length >= 2) return base; // máx 2
      return [...base, key];
    });
  }

  const noSe = sel.includes("no_se");

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-efa-bone">
        Posición <span className="font-normal text-efa-ash">— toca hasta 2 sobre la cancha</span>
      </p>

      <div className="rounded-xl border border-efa-ash/30 bg-efa-ink p-3">
        <svg viewBox="0 0 300 260" className="w-full" role="group" aria-label="Cancha de vóley">
          {/* Cancha */}
          <rect x="30" y="20" width="240" height="220" rx="6" fill="#14532d22" stroke="currentColor" className="text-efa-ash/50" strokeWidth="2" />
          {/* Red (arriba) */}
          <line x1="30" y1="20" x2="270" y2="20" stroke="currentColor" className="text-efa-bone" strokeWidth="4" strokeDasharray="6 4" />
          {/* Línea de ataque (3m) */}
          <line x1="30" y1="120" x2="270" y2="120" stroke="currentColor" className="text-efa-ash/40" strokeWidth="2" strokeDasharray="4 4" />

          {SPOTS.map((s) => {
            const active = sel.includes(s.key);
            return (
              <g
                key={s.key}
                onClick={() => toggle(s.key)}
                style={{ cursor: noSe ? "not-allowed" : "pointer" }}
                opacity={noSe ? 0.4 : 1}
              >
                <circle
                  cx={s.x}
                  cy={s.y}
                  r="28"
                  fill={active ? "#d81f26" : "#0e0e0f"}
                  stroke={active ? "#d81f26" : "currentColor"}
                  className={active ? "" : "text-efa-ash/60"}
                  strokeWidth="2"
                />
                <text
                  x={s.x}
                  y={s.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={active ? "#f2ece1" : "#c9c3b8"}
                >
                  {s.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <button
        type="button"
        onClick={() => toggle("no_se")}
        className={`mt-3 w-full rounded-md border px-4 py-2 text-sm font-semibold transition ${
          noSe
            ? "border-efa-red bg-efa-red/15 text-efa-red"
            : "border-efa-ash/40 text-efa-bone hover:border-efa-red"
        }`}
      >
        Aún no sé mi posición
      </button>

      {sel.map((k) => (
        <input key={k} type="hidden" name="posiciones" value={k} />
      ))}
    </div>
  );
}
