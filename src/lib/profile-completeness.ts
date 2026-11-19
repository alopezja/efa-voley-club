// Cálculo del "% de perfil completo" del jugador. Puro (sin IO) para testear fácil.

export type CompletenessInput = {
  foto_url: string | null;
  posiciones: string[];
  experiencia: number | null;
  fecha_nacimiento: string | null;
  eps: string | null;
  contacto_emergencia: string | null;
  mano_dominante: string | null;
  disponibilidad: string[];
  quiere_camiseta: boolean | null;
  camiseta_color: string | null;
  camiseta_talla: string | null;
  tieneNumero: boolean; // tiene número asignado en al menos un equipo
};

export type CompletenessItem = { key: string; label: string; done: boolean };
export type Completeness = {
  pct: number;
  done: number;
  total: number;
  items: CompletenessItem[];
};

function noVacio(s: string | null): boolean {
  return !!s && s.trim().length > 0;
}

export function computeCompleteness(p: CompletenessInput): Completeness {
  const camisetaDecidida =
    p.quiere_camiseta === false ||
    (p.quiere_camiseta === true && noVacio(p.camiseta_color) && noVacio(p.camiseta_talla));

  const items: CompletenessItem[] = [
    { key: "foto", label: "Foto", done: noVacio(p.foto_url) },
    { key: "posiciones", label: "Posición", done: p.posiciones.length > 0 },
    { key: "experiencia", label: "Experiencia", done: p.experiencia != null },
    { key: "fecha_nacimiento", label: "Fecha de nacimiento", done: noVacio(p.fecha_nacimiento) },
    { key: "eps", label: "EPS", done: noVacio(p.eps) },
    { key: "contacto_emergencia", label: "Contacto de emergencia", done: noVacio(p.contacto_emergencia) },
    { key: "mano_dominante", label: "Mano dominante", done: noVacio(p.mano_dominante) },
    { key: "disponibilidad", label: "Disponibilidad", done: p.disponibilidad.length > 0 },
    { key: "camiseta", label: "Camiseta", done: camisetaDecidida },
    { key: "numero", label: "Número", done: p.tieneNumero },
  ];

  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = Math.round((done / total) * 100);
  return { pct, done, total, items };
}

// Mensaje motivacional según el avance y lo que falta.
export function mensajeCompletitud(c: Completeness): string {
  if (c.pct >= 100) return "¡Perfil completo! 🎉 Ya eres parte del equipo.";
  const falta = c.items.find((i) => !i.done);
  const detalle = falta ? ` Te falta: ${falta.label.toLowerCase()}.` : "";
  if (c.pct >= 70) return `¡Casi listo!${detalle}`;
  if (c.pct >= 30) return `Vas bien, sigue completando tu perfil.${detalle}`;
  return `¡Empecemos! Completa tu perfil para sumarte al equipo.${detalle}`;
}
