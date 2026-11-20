import Link from "next/link";
import { requireJugador } from "@/lib/auth";
import { getMiPlayer, getMiCompletitud, linkPlayerByEmail } from "@/lib/player-profile";
import { mensajeCompletitud } from "@/lib/profile-completeness";
import { CompletenessRing } from "@/components/jugador/completeness-ring";
import { ProfileReadyCard } from "@/components/jugador/profile-ready-card";
import { getUpcomingGames, getMisAsistencias } from "@/lib/games";
import { GameCard } from "@/components/jugador/game-card";
import { getConvocatoriasDeJugador } from "@/lib/convocados";
import { ConvocadoBanner } from "@/components/jugador/convocado-banner";
import { getCumpleanosDelMes, getResumenLogros } from "@/lib/comunidad";
import { calcularLogros } from "@/lib/logros";
import { LogrosStrip } from "@/components/jugador/logros-strip";
import { CumpleanosCard } from "@/components/jugador/cumpleanos-card";
import { PushPrompt } from "@/components/jugador/push-prompt";

export const dynamic = "force-dynamic";

const INVITE_MSG =
  "¡Juega vóley con nosotros en EFA Voley Club! Regístrate aquí: https://efavoleyclub.com/registro";
const INVITE_URL = `https://wa.me/?text=${encodeURIComponent(INVITE_MSG)}`;

export default async function JugadorHomePage() {
  const { user } = await requireJugador();
  await linkPlayerByEmail(user.id, user.email);
  const player = await getMiPlayer(user.id);

  if (!player) {
    return (
      <div className="rounded-2xl border border-efa-ash/30 bg-efa-ink p-6">
        <h1 className="mb-2 text-3xl">¡Hola!</h1>
        <p className="text-efa-ash">
          No encontramos tu registro con este correo ({user.email}). Puede que te hayas registrado
          con otro correo. Escríbele al club para ayudarte.
        </p>
      </div>
    );
  }

  const { completeness, memberships } = await getMiCompletitud(player);
  const completo = completeness.pct >= 100;
  const [games, asistencias, convocado, cumples, resumen] = await Promise.all([
    getUpcomingGames(4),
    getMisAsistencias(player.id),
    getConvocatoriasDeJugador(player.id),
    getCumpleanosDelMes(),
    getResumenLogros(player.id),
  ]);
  const logros = calcularLogros(resumen);

  return (
    <div className="space-y-8">
      <ConvocadoBanner convocatorias={convocado} />

      <div>
        <h1 className="text-3xl sm:text-4xl">
          ¡Hola, {player.nombre}! 🏐
        </h1>
        <p className="mt-1 text-efa-ash">Este es tu espacio en el club.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        {/* Columna central: perfil, logros y cumpleaños */}
        <div className="space-y-8">
          {completo ? (
            <ProfileReadyCard
              nombre={`${player.nombre} ${player.apellido}`.trim()}
              fotoUrl={player.foto_url}
              posiciones={player.posiciones}
              memberships={memberships}
            />
          ) : (
            <CompletenessRing completeness={completeness} mensaje={mensajeCompletitud(completeness)} />
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/jugador/perfil"
              className="rounded-md bg-efa-red px-5 py-3 text-center text-base font-semibold text-efa-chalk transition hover:opacity-90"
            >
              {completeness.pct >= 100 ? "Editar mi perfil" : "Completar mi perfil"}
            </Link>
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-efa-ash/50 px-5 py-3 text-center text-base font-semibold text-efa-bone transition hover:border-efa-red hover:text-efa-red"
            >
              Invitar a un amigo por WhatsApp
            </a>
          </div>

          <LogrosStrip logros={logros} />
          <CumpleanosCard cumples={cumples} />
        </div>

        {/* Columna derecha: aviso para activar notificaciones + próximos juegos con relieve */}
        <aside className="space-y-6 lg:sticky lg:top-20">
          <PushPrompt />

          <section className="rounded-2xl border border-efa-red/40 bg-gradient-to-b from-white/[0.07] to-white/[0.01] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_36px_-14px_rgba(0,0,0,0.75)] ring-1 ring-black/30">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-6 w-1.5 rounded-full bg-efa-red" />
              <h2 className="text-xl font-semibold text-efa-bone">Próximos juegos</h2>
            </div>
            {games.length === 0 ? (
              <p className="text-sm text-efa-ash">No hay juegos programados por ahora.</p>
            ) : (
              <div className="space-y-3">
                {games.map((g) => (
                  <GameCard key={g.key} game={g} asistencia={asistencias[g.key] ?? null} />
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
