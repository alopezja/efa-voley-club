// Utilidades puras para calcular las próximas fechas de los entrenamientos
// recurrentes (desde el nombre del día), parsear el horario de texto, y armar
// el enlace de Google Calendar. Colombia no tiene horario de verano: UTC-5.

const OFFSET = "-05:00";

function normaliza(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

const DIAS: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
};

export function diaAWeekday(dia: string): number | null {
  const n = normaliza(dia);
  for (const [k, v] of Object.entries(DIAS)) {
    if (n.includes(k)) return v;
  }
  return null;
}

function ymd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Próximas `cantidad` fechas (YYYY-MM-DD) que caen en ese día de la semana,
// contando desde `desde` (incluye hoy si coincide). Trabaja en UTC para ser determinista.
export function proximasFechas(dia: string, desde: Date, cantidad = 2): string[] {
  const wd = diaAWeekday(dia);
  if (wd == null) return [];
  const out: string[] = [];
  const cursor = new Date(Date.UTC(desde.getUTCFullYear(), desde.getUTCMonth(), desde.getUTCDate()));
  // avanza hasta el primer match
  let guard = 0;
  while (cursor.getUTCDay() !== wd && guard < 8) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard++;
  }
  for (let i = 0; i < cantidad; i++) {
    out.push(ymd(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
  return out;
}

// Parsea "8:00 pm - 11:00 pm" → { inicio: "20:00", fin: "23:00" }.
export function parseHorario(text: string | null): { inicio: string | null; fin: string | null } {
  if (!text) return { inicio: null, fin: null };
  const re = /(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m\.?/gi;
  const found: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    const pm = m[3].toLowerCase() === "p";
    if (pm && h !== 12) h += 12;
    if (!pm && h === 12) h = 0;
    found.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return { inicio: found[0] ?? null, fin: found[1] ?? null };
}

function toUTCStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// Construye una fecha absoluta a partir de YYYY-MM-DD + HH:MM en hora de Colombia.
export function fechaColombia(fecha: string, hora: string): Date {
  return new Date(`${fecha}T${hora}:00${OFFSET}`);
}

export function googleCalendarUrl(opts: {
  titulo: string;
  inicio: Date;
  fin: Date;
  lugar?: string | null;
  detalle?: string | null;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.titulo,
    dates: `${toUTCStamp(opts.inicio)}/${toUTCStamp(opts.fin)}`,
  });
  if (opts.lugar) params.set("location", opts.lugar);
  if (opts.detalle) params.set("details", opts.detalle);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
