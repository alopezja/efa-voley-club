import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { getPlayerDetalle } from "@/lib/players";
import { getPlayerMemberships, TIPO_LABEL } from "@/lib/teams";
import { getSchedules } from "@/lib/schedules";
import { AdminPlayerForm, type MembershipView } from "@/components/admin/admin-player-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ficha de jugador", robots: { index: false, follow: false } };

export default async function FichaJugadorPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePerm("jugadores");
  const { id } = await params;
  const p = await getPlayerDetalle(id);
  if (!p) notFound();

  const memberships = await getPlayerMemberships(id);
  const views: MembershipView[] = memberships.map((m) => ({
    teamId: m.team_id,
    nombre: m.team?.nombre ?? "Equipo",
    tipoLabel: m.team ? TIPO_LABEL[m.team.tipo] : "",
    numero: m.numero,
  }));

  const schedules = await getSchedules();
  const diasSet = Array.from(new Set(schedules.map((s) => s.dia).filter(Boolean)));
  const dias = diasSet.length > 0 ? diasSet : ["Martes", "Viernes"];

  return (
    <div className="max-w-2xl">
      <Link href="/admin/jugadores" className="text-sm text-efa-ash hover:text-efa-bone">
        ← Volver a jugadores
      </Link>

      <div className="mb-8 mt-3 flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-efa-ash/20">
          {p.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.foto_url} alt={p.nombre} className="h-20 w-20 object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center font-display text-2xl text-efa-bone">
              {p.nombre.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl">
            {p.nombre} {p.apellido}
          </h1>
          <p className="text-sm text-efa-ash">
            Editar datos del jugador{p.estado ? ` · ${p.estado}` : ""}
          </p>
        </div>
      </div>

      <AdminPlayerForm player={p} memberships={views} dias={dias} />
    </div>
  );
}
