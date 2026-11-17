// Datos del club en un solo lugar. Cambia CLUB_WHATSAPP cuando se confirme el número.

export type Horario = { dia: string; lugar: string; horario: string };

export const HORARIOS: Horario[] = [
  { dia: "Martes", lugar: "Cancha de Manila", horario: "8:00 – 11:00 pm" },
  { dia: "Viernes", lugar: "Cancha Yesid Santos (Estadio)", horario: "9:30 – 11:00 pm" },
];

// Número de WhatsApp en formato internacional SIN "+" ni espacios (ej: "573001112233").
// Vacío = el botón de WhatsApp no se muestra todavía.
export const CLUB_WHATSAPP = "";

export function whatsappLink(message: string): string | null {
  if (!CLUB_WHATSAPP) return null;
  return `https://wa.me/${CLUB_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
