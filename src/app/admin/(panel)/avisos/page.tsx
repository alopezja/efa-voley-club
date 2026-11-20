import type { Metadata } from "next";
import { requirePerm } from "@/lib/auth";
import { getTeams } from "@/lib/teams";
import { getAprobadosBasico } from "@/lib/players";
import { AvisoForm } from "@/components/admin/aviso-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Avisos", robots: { index: false, follow: false } };

export default async function AvisosPage() {
  await requirePerm("avisos");
  const [teams, aprobados] = await Promise.all([getTeams(), getAprobadosBasico()]);
  const players = aprobados.map((p) => ({ id: p.id, nombre: `${p.nombre} ${p.apellido}`.trim() }));
  const teamPicks = teams.map((t) => ({ id: t.id, nombre: t.nombre }));

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-3xl">Avisos</h1>
      <p className="mb-8 text-sm text-efa-ash">
        Envía un aviso al buzón de notificaciones de los jugadores. Si tienen las notificaciones
        activadas, también les llega al dispositivo.
      </p>
      <AvisoForm teams={teamPicks} players={players} />
    </div>
  );
}
