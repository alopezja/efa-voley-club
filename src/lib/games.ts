import { createClient } from "@/lib/supabase/server";
import { getSchedules } from "@/lib/schedules";
import { getUpcomingConvocatorias } from "@/lib/convocatorias";
import { proximasFechas, parseHorario, fechaColombia, googleCalendarUrl } from "@/lib/game-dates";

export type GameTipo = "entreno" | "convocatoria";

export type Game = {
  key: string; // `${tipo}:${refId}:${fecha}`
  tipo: GameTipo;
  refId: string;
  fecha: string; // YYYY-MM-DD
  titulo: string;
  lugar: string | null;
  horaTexto: string | null;
  comoLlegarUrl: string | null;
  calendarUrl: string | null;
  ordenTs: number;
};

export type Asistencia = {
  tipo: GameTipo;
  ref_id: string;
  fecha: string;
  estado: "voy" | "no_voy";
  molestia_zona: string | null;
  molestia_nivel: string | null;
  molestia_nota: string | null;
};

function comoLlegar(mapsUrl: string | null, lugar: string | null): string | null {
  if (mapsUrl) return mapsUrl;
  if (lugar) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`;
  return null;
}

export async function getUpcomingGames(limit = 4): Promise<Game[]> {
  const [schedules, convocatorias] = await Promise.all([
    getSchedules(),
    getUpcomingConvocatorias(5),
  ]);
  const hoy = new Date();
  const games: Game[] = [];

  // Entrenos recurrentes: próximas 2 fechas por cada horario.
  for (const s of schedules) {
    const fechas = proximasFechas(s.dia, hoy, 2);
    const { inicio, fin } = parseHorario(s.horario);
    for (const fecha of fechas) {
      let calendarUrl: string | null = null;
      if (inicio) {
        const ini = fechaColombia(fecha, inicio);
        const end = fin ? fechaColombia(fecha, fin) : new Date(ini.getTime() + 2 * 3600 * 1000);
        calendarUrl = googleCalendarUrl({
          titulo: `Entreno EFA Voley${s.lugar ? ` — ${s.lugar}` : ""}`,
          inicio: ini,
          fin: end,
          lugar: s.lugar,
          detalle: s.descripcion,
        });
      }
      games.push({
        key: `entreno:${s.id}:${fecha}`,
        tipo: "entreno",
        refId: s.id,
        fecha,
        titulo: "Entrenamiento",
        lugar: s.lugar,
        horaTexto: s.horario,
        comoLlegarUrl: comoLlegar(s.maps_url, s.lugar),
        calendarUrl,
        ordenTs: fechaColombia(fecha, inicio ?? "19:00").getTime(),
      });
    }
  }

  // Convocatorias futuras.
  for (const c of convocatorias) {
    if (!c.fecha_torneo) continue;
    const dt = new Date(c.fecha_torneo);
    const fecha = dt.toISOString().slice(0, 10);
    const end = new Date(dt.getTime() + 2 * 3600 * 1000);
    games.push({
      key: `convocatoria:${c.id}:${fecha}`,
      tipo: "convocatoria",
      refId: c.id,
      fecha,
      titulo: c.titulo,
      lugar: c.lugar,
      horaTexto: new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit" }).format(dt),
      comoLlegarUrl: comoLlegar(null, c.lugar),
      calendarUrl: googleCalendarUrl({
        titulo: c.titulo,
        inicio: dt,
        fin: end,
        lugar: c.lugar,
        detalle: c.descripcion,
      }),
      ordenTs: dt.getTime(),
    });
  }

  games.sort((a, b) => a.ordenTs - b.ordenTs);
  return games.slice(0, limit);
}

export type ConfirmRef = {
  nombre: string;
  molestiaZona: string | null;
  molestiaNivel: string | null;
  molestiaNota: string | null;
};
export type JuegoConfirmaciones = { voy: ConfirmRef[]; no_voy: ConfirmRef[] };

// Para el admin: confirmaciones (voy/no_voy) por cada juego de la lista.
export async function getAsistenciasAdmin(
  games: Game[]
): Promise<Record<string, JuegoConfirmaciones>> {
  const map: Record<string, JuegoConfirmaciones> = {};
  for (const g of games) map[g.key] = { voy: [], no_voy: [] };
  if (games.length === 0) return map;

  try {
    const sb = await createClient();
    const refIds = [...new Set(games.map((g) => g.refId))];
    const fechas = [...new Set(games.map((g) => g.fecha))];
    const { data } = await sb
      .from("asistencias")
      .select("tipo,ref_id,fecha,estado,molestia_zona,molestia_nivel,molestia_nota,players(nombre,apellido)")
      .in("ref_id", refIds)
      .in("fecha", fechas);

    for (const a of data ?? []) {
      const key = `${a.tipo}:${a.ref_id}:${a.fecha}`;
      if (!map[key]) continue;
      const p = a.players as unknown as { nombre: string; apellido: string } | null;
      const ref: ConfirmRef = {
        nombre: p ? `${p.nombre} ${p.apellido}`.trim() : "Jugador",
        molestiaZona: a.molestia_zona,
        molestiaNivel: a.molestia_nivel,
        molestiaNota: a.molestia_nota,
      };
      if (a.estado === "voy") map[key].voy.push(ref);
      else map[key].no_voy.push(ref);
    }
  } catch {
    // vacío
  }
  return map;
}

// Asistencias del jugador indexadas por `key` (tipo:refId:fecha).
export async function getMisAsistencias(playerId: string): Promise<Record<string, Asistencia>> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("asistencias")
      .select("tipo,ref_id,fecha,estado,molestia_zona,molestia_nivel,molestia_nota")
      .eq("player_id", playerId);
    const map: Record<string, Asistencia> = {};
    for (const a of (data ?? []) as Asistencia[]) {
      map[`${a.tipo}:${a.ref_id}:${a.fecha}`] = a;
    }
    return map;
  } catch {
    return {};
  }
}
