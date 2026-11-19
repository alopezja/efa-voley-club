import type { Cumple } from "@/lib/comunidad";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function CumpleanosCard({ cumples }: { cumples: Cumple[] }) {
  if (cumples.length === 0) return null;
  const mes = MESES[new Date().getMonth()];

  return (
    <section className="rounded-2xl border border-efa-ash/30 bg-efa-ink p-6">
      <h2 className="mb-3 text-2xl text-efa-bone">🎂 Cumpleaños de {mes}</h2>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {cumples.map((c, i) => (
          <li key={i} className="text-efa-bone">
            <span className="font-display text-efa-red">{c.dia}</span>{" "}
            <span className="text-sm">{c.nombre}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
