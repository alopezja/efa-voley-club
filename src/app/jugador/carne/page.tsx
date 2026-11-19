import { requireJugador } from "@/lib/auth";
import { getMiPlayer, linkPlayerByEmail } from "@/lib/player-profile";
import { getPlayerMemberships } from "@/lib/teams";
import { CarneCard } from "@/components/jugador/carne-card";

export const dynamic = "force-dynamic";

export default async function JugadorCarnePage() {
  const { user } = await requireJugador();
  await linkPlayerByEmail(user.id, user.email);
  const player = await getMiPlayer(user.id);

  if (!player) {
    return (
      <div className="rounded-2xl border border-efa-ash/30 bg-efa-ink p-6">
        <h1 className="mb-2 text-3xl">Carné</h1>
        <p className="text-efa-ash">No encontramos tu registro.</p>
      </div>
    );
  }

  const memberships = await getPlayerMemberships(player.id);
  const principal = memberships.find((m) => m.numero != null) ?? memberships[0];

  return (
    <div>
      <h1 className="mb-2 text-3xl sm:text-4xl">Mi carné</h1>
      <p className="mb-8 text-efa-ash">Tu credencial de jugador del club.</p>
      <CarneCard
        d={{
          nombre: `${player.nombre} ${player.apellido}`.trim(),
          fotoUrl: player.foto_url,
          numero: principal?.numero ?? null,
          equipo: principal?.team?.nombre ?? null,
          tipo: principal?.team?.tipo ?? null,
          posiciones: player.posiciones ?? [],
          experiencia: player.experiencia,
          codigo: player.id.slice(0, 8).toUpperCase(),
        }}
      />
    </div>
  );
}
