import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { getPlayerDetalle } from "@/lib/players";
import { getPlayerMemberships, TIPO_LABEL } from "@/lib/teams";
import { labelPosicion } from "@/lib/positions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ficha de jugador", robots: { index: false, follow: false } };

const MANO: Record<string, string> = { diestro: "Diestro", zurdo: "Zurdo", no_se: "No sabe" };
const COLOR: Record<string, string> = { roja: "Roja", negra: "Negra", ambas: "Ambas" };

function edad(fecha: string | null): string {
  if (!fecha) return "—";
  const n = new Date(fecha);
  if (Number.isNaN(n.getTime())) return "—";
  const hoy = new Date();
  let e = hoy.getFullYear() - n.getFullYear();
  const m = hoy.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) e--;
  return `${e} años`;
}

function Dato({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-efa-ash">{k}</dt>
      <dd className="text-efa-bone">{v || "—"}</dd>
    </div>
  );
}

export default async function FichaJugadorPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePerm("jugadores");
  const { id } = await params;
  const p = await getPlayerDetalle(id);
  if (!p) notFound();
  const memberships = await getPlayerMemberships(id);

  const pos = p.posiciones.filter((x) => x !== "no_se").map(labelPosicion).join(" · ") || "—";
  const camiseta =
    p.quiere_camiseta === true
      ? `${COLOR[p.camiseta_color ?? ""] ?? "—"} · ${p.camiseta_talla ?? "—"}${p.apodo ? ` · "${p.apodo}"` : ""}`
      : p.quiere_camiseta === false
        ? "No quiere"
        : "—";

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
            {memberships.map((m) => `${m.team?.nombre ?? ""}${m.numero != null ? ` #${m.numero}` : ""}`).join(" · ") ||
              "Sin equipo"}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Dato k="Correo" v={p.email} />
        <Dato k="Teléfono" v={p.telefono} />
        <Dato k="Edad" v={edad(p.fecha_nacimiento)} />
        <Dato k="Posición" v={pos} />
        <Dato k="Experiencia" v={p.experiencia != null ? `${p.experiencia}/10` : "—"} />
        <Dato k="Mano dominante" v={p.mano_dominante ? MANO[p.mano_dominante] : "—"} />
        <Dato k="Disponibilidad" v={p.disponibilidad.join(", ")} />
        <Dato k="Camiseta" v={camiseta} />
        <Dato k="Equipos" v={memberships.map((m) => `${m.team?.nombre ?? ""} (${m.team ? TIPO_LABEL[m.team.tipo] : ""})`).join(", ")} />
      </dl>

      {/* Datos sensibles */}
      <div className="mt-8 rounded-lg border border-efa-red/30 bg-efa-red/5 p-4">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-efa-red">Salud y emergencia</p>
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Dato k="EPS / seguro" v={p.eps} />
          <Dato k="Contacto de emergencia" v={p.contacto_emergencia} />
        </dl>
      </div>
    </div>
  );
}
