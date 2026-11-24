import type { Metadata } from "next";
import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { getAllConvocatorias, type Convocatoria } from "@/lib/convocatorias";
import { deleteConvocatoria } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Convocatorias", robots: { index: false, follow: false } };

function fecha(c: Convocatoria): string {
  if (!c.fecha_torneo) return "Sin fecha";
  try {
    return new Intl.DateTimeFormat("es", { timeZone: "America/Bogota", dateStyle: "medium", timeStyle: "short" }).format(new Date(c.fecha_torneo));
  } catch {
    return "";
  }
}

export default async function AdminConvocatoriasPage() {
  await requirePerm("convocatorias");
  const items = await getAllConvocatorias();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-4xl">Convocatorias</h1>
        <Link
          href="/admin/convocatorias/nueva"
          className="rounded-md bg-efa-red px-4 py-2 text-sm font-semibold text-efa-chalk hover:opacity-90"
        >
          Nueva convocatoria
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-efa-ash">Aún no hay convocatorias. Crea la primera.</p>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-3 rounded-lg border border-efa-ash/30 bg-efa-ink p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-efa-bone">{c.titulo}</p>
                <p className="text-sm text-efa-ash">
                  {fecha(c)}
                  {c.lugar ? ` · ${c.lugar}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                    c.estado === "publicado" ? "bg-green-500/20 text-green-300" : "bg-efa-ash/20 text-efa-ash"
                  }`}
                >
                  {c.estado}
                </span>
                <Link
                  href={`/admin/convocatorias/${c.id}`}
                  className="rounded-md border border-efa-ash/50 px-3 py-2 text-sm font-semibold text-efa-bone hover:border-efa-red hover:text-efa-red"
                >
                  Editar
                </Link>
                <form action={deleteConvocatoria}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-sm font-semibold text-efa-red hover:underline">Borrar</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
