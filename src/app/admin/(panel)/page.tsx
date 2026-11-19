import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPlayersAdmin } from "@/lib/players";
import { getTeams } from "@/lib/teams";
import { getUpcomingGames } from "@/lib/games";
import { getCamisetaReport } from "@/lib/camisetas";

export const dynamic = "force-dynamic";

function fechaCorta(fecha: string): string {
  const d = new Date(`${fecha}T12:00:00-05:00`);
  const s = new Intl.DateTimeFormat("es", { weekday: "short", day: "numeric", month: "short" }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Kpi({ value, label, accent }: { value: string | number; label: string; accent?: "red" | "green" }) {
  const color = accent === "green" ? "text-green-400" : accent === "red" ? "text-efa-red" : "text-efa-bone";
  return (
    <div className="rounded-xl border border-efa-ash/30 bg-efa-ink p-5">
      <p className={`font-display text-5xl ${color}`}>{value}</p>
      <p className="mt-1 text-sm text-efa-ash">{label}</p>
    </div>
  );
}

function Alerta({ href, n, label }: { href: string; n: number; label: string }) {
  const activo = n > 0;
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-xl border p-4 transition ${
        activo ? "border-efa-red/50 bg-efa-red/10 hover:bg-efa-red/15" : "border-efa-ash/25 bg-efa-ink hover:border-efa-ash/50"
      }`}
    >
      <span className="text-sm font-semibold text-efa-bone">{label}</span>
      <span className={`font-display text-2xl ${activo ? "text-efa-red" : "text-efa-ash"}`}>{n}</span>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const [players, teams, games, camisetas, challenges, messages] = await Promise.all([
    getPlayersAdmin(),
    getTeams(),
    getUpcomingGames(3),
    getCamisetaReport(),
    supabase.from("challenges").select("*", { count: "exact", head: true }).eq("leido", false),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("leido", false),
  ]);

  const aprobados = players.filter((p) => p.estado === "aprobado");
  const pendientes = players.filter((p) => p.estado === "pendiente").length;
  const avgPct = aprobados.length
    ? Math.round(aprobados.reduce((s, p) => s + p.pct, 0) / aprobados.length)
    : 0;
  const completos = aprobados.filter((p) => p.pct >= 100).length;
  const incompletos = aprobados.filter((p) => p.pct < 100).sort((a, b) => a.pct - b.pct).slice(0, 5);
  const totalMiembros = teams.reduce((s, t) => s + t.miembros, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl">Hola 👋</h1>
        <p className="mt-1 text-sm text-efa-ash">{user.email}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi value={aprobados.length} label="Jugadores aprobados" />
        <div className="rounded-xl border border-efa-ash/30 bg-efa-ink p-5">
          <p className="font-display text-5xl text-efa-bone">{avgPct}%</p>
          <p className="mt-1 text-sm text-efa-ash">Perfil promedio</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-efa-ash/20">
            <div className="h-full bg-efa-red" style={{ width: `${avgPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-efa-ash">{completos} al 100%</p>
        </div>
        <Kpi value={teams.length} label={`Equipos · ${totalMiembros} cupos`} />
        <Kpi value={games.length} label="Próximos juegos" />
      </div>

      {/* Alertas accionables */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Alerta href="/admin/jugadores" n={pendientes} label="Jugadores pendientes" />
        <Alerta href="/admin/mensajes" n={messages.count ?? 0} label="Mensajes sin leer" />
        <Alerta href="/admin/retos" n={challenges.count ?? 0} label="Retos sin leer" />
      </div>

      {/* Dos columnas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos juegos */}
        <section className="rounded-xl border border-efa-ash/30 bg-efa-ink p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl text-efa-bone">Próximos juegos</h2>
            <Link href="/admin/asistencias" className="text-xs font-semibold text-efa-red hover:underline">
              Ver asistencias →
            </Link>
          </div>
          {games.length === 0 ? (
            <p className="text-sm text-efa-ash">No hay juegos programados.</p>
          ) : (
            <ul className="space-y-2">
              {games.map((g) => (
                <li key={g.key} className="flex items-center justify-between border-b border-efa-ash/15 pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-efa-bone">
                      <span className="text-efa-red">{g.etiqueta}</span> · {g.titulo}
                    </p>
                    <p className="text-xs text-efa-ash">
                      {fechaCorta(g.fecha)}
                      {g.lugar ? ` · ${g.lugar}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Perfiles por completar */}
        <section className="rounded-xl border border-efa-ash/30 bg-efa-ink p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl text-efa-bone">Perfiles por completar</h2>
            <Link href="/admin/jugadores" className="text-xs font-semibold text-efa-red hover:underline">
              Ver todos →
            </Link>
          </div>
          {incompletos.length === 0 ? (
            <p className="text-sm text-efa-ash">¡Todos los aprobados tienen el perfil completo! 🎉</p>
          ) : (
            <ul className="space-y-2.5">
              {incompletos.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <Link
                    href={`/admin/jugadores/${p.id}`}
                    className="min-w-0 flex-1 truncate text-sm text-efa-bone hover:text-efa-red"
                  >
                    {p.nombre} {p.apellido}
                  </Link>
                  <span className="h-1.5 w-20 overflow-hidden rounded-full bg-efa-ash/20">
                    <span className="block h-full bg-efa-red" style={{ width: `${p.pct}%` }} />
                  </span>
                  <span className="w-9 text-right text-xs font-semibold text-efa-ash">{p.pct}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Camisetas */}
      <Link
        href="/admin/camisetas"
        className="flex items-center justify-between rounded-xl border border-efa-ash/30 bg-efa-ink p-5 transition hover:border-efa-red/50"
      >
        <div>
          <h2 className="text-xl text-efa-bone">👕 Pedido de camisetas</h2>
          <p className="text-sm text-efa-ash">
            {camisetas.totalUnidades > 0
              ? `${camisetas.totalUnidades} unidades por pedir · ${camisetas.items.length} jugadores`
              : "Nadie ha pedido camiseta aún."}
          </p>
        </div>
        <span className="font-display text-4xl text-efa-red">{camisetas.totalUnidades}</span>
      </Link>
    </div>
  );
}
