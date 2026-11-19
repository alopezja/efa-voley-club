// Validación y sugerencia de número de camiseta (único por equipo).

export function validarNumero(n: number): { ok: boolean } {
  return { ok: Number.isInteger(n) && n >= 1 && n <= 99 };
}

export function numeroDisponible(n: number, ocupados: number[]): boolean {
  return !ocupados.includes(n);
}

export function numerosLibres(ocupados: number[]): number[] {
  const set = new Set(ocupados);
  const out: number[] = [];
  for (let i = 1; i <= 99; i++) if (!set.has(i)) out.push(i);
  return out;
}

// Devuelve el preferido si está libre y es válido; si no, el primer libre.
export function sugerirNumero(preferido: number | null, ocupados: number[]): number | null {
  if (preferido && validarNumero(preferido).ok && numeroDisponible(preferido, ocupados)) {
    return preferido;
  }
  return numerosLibres(ocupados)[0] ?? null;
}
