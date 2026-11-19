"use client";

import { useState } from "react";

const NIVELES: Record<number, string> = {
  1: "Nunca he jugado. Estoy empezando desde cero.",
  2: "Casi no he jugado; conozco muy poco.",
  3: "He jugado informal (recreo o playa). Sé lo básico.",
  4: "Juego de vez en cuando; entiendo las reglas generales.",
  5: "Juego con cierta regularidad; entiendo la rotación.",
  6: "Juego seguido; manejo posiciones y fundamentos.",
  7: "Experiencia sólida; he jugado en equipos.",
  8: "Buen nivel; he jugado ligas o torneos locales.",
  9: "Nivel competitivo; bastante técnica y juego.",
  10: "Muy experimentado; torneos, técnica y reglas al detalle.",
};

export function ExperienceSlider({ defaultValue }: { defaultValue: number | null }) {
  const [value, setValue] = useState<number>(defaultValue ?? 5);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor="experiencia" className="text-sm font-semibold text-efa-bone">
          Experiencia
        </label>
        <span className="font-display text-2xl text-efa-red">{value}/10</span>
      </div>
      <input
        id="experiencia"
        name="experiencia"
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-efa-red"
      />
      <p className="mt-2 min-h-[2.5rem] rounded-md bg-efa-ash/10 px-3 py-2 text-sm text-efa-bone">
        {NIVELES[value]}
      </p>
    </div>
  );
}
