// Catálogo de posiciones de vóley para el perfil del jugador.

export const POSICIONES = [
  { key: "armador", label: "Armador(a)" },
  { key: "opuesto", label: "Opuesto(a)" },
  { key: "central", label: "Central" },
  { key: "punta", label: "Punta / Receptor" },
  { key: "libero", label: "Líbero" },
  { key: "no_se", label: "Aún no sé" },
] as const;

export type PosicionKey = (typeof POSICIONES)[number]["key"];

const KEYS = POSICIONES.map((p) => p.key) as string[];

// Máximo 2 posiciones; todas deben ser válidas; al menos una.
export function validarPosiciones(xs: string[]): { ok: boolean } {
  if (xs.length === 0 || xs.length > 2) return { ok: false };
  return { ok: xs.every((x) => KEYS.includes(x)) };
}

export function labelPosicion(key: string): string {
  return POSICIONES.find((p) => p.key === key)?.label ?? key;
}
