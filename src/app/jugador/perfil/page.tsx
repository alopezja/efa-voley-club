import { requireJugador } from "@/lib/auth";
import { getMiPlayer, linkPlayerByEmail } from "@/lib/player-profile";
import { getPlayerMemberships, getTeamOccupiedNumbers, TIPO_LABEL } from "@/lib/teams";
import { getSchedules } from "@/lib/schedules";
import { sugerirNumero } from "@/lib/teams-validation";
import { ProfileForm, type MembershipView } from "@/components/jugador/profile-form";

export const dynamic = "force-dynamic";

export default async function JugadorPerfilPage() {
  const { user } = await requireJugador();
  await linkPlayerByEmail(user.id, user.email);
  const player = await getMiPlayer(user.id);

  if (!player) {
    return (
      <div className="rounded-2xl border border-efa-ash/30 bg-efa-ink p-6">
        <h1 className="mb-2 text-3xl">Completa tu perfil</h1>
        <p className="text-efa-ash">
          No encontramos tu registro con este correo ({user.email}). Escríbele al club para ayudarte.
        </p>
      </div>
    );
  }

  const memberships = await getPlayerMemberships(player.id);

  // Número preferido = el que ya tiene en algún equipo (para sugerir el mismo).
  const preferido = memberships.find((m) => m.numero != null)?.numero ?? null;

  const views: MembershipView[] = await Promise.all(
    memberships.map(async (m) => {
      const ocupadosRaw = await getTeamOccupiedNumbers(m.team_id);
      const ocupados = ocupadosRaw.filter((n) => n !== m.numero); // excluye el propio
      return {
        teamId: m.team_id,
        nombre: m.team?.nombre ?? "Equipo",
        tipoLabel: m.team ? TIPO_LABEL[m.team.tipo] : "",
        numero: m.numero,
        sugerido: sugerirNumero(m.numero ?? preferido, ocupados),
      };
    })
  );

  const schedules = await getSchedules();
  const diasSet = Array.from(new Set(schedules.map((s) => s.dia).filter(Boolean)));
  const dias = diasSet.length > 0 ? diasSet : ["Martes", "Viernes"];

  return (
    <div>
      <h1 className="mb-2 text-3xl sm:text-4xl">Mi perfil</h1>
      <p className="mb-8 text-efa-ash">
        Completa tus datos para el equipo. Todo suma a tu % de perfil.
      </p>
      <ProfileForm player={player} memberships={views} dias={dias} />
    </div>
  );
}
