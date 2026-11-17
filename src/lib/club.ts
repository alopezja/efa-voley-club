// Datos del club. Los horarios ahora se editan desde el panel (tabla schedules).
// Cambia CLUB_WHATSAPP cuando se confirme el número.

// Número de WhatsApp en formato internacional SIN "+" ni espacios (ej: "573001112233").
// Vacío = el botón de WhatsApp no se muestra todavía.
export const CLUB_WHATSAPP = "";

export function whatsappLink(message: string): string | null {
  if (!CLUB_WHATSAPP) return null;
  return `https://wa.me/${CLUB_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
