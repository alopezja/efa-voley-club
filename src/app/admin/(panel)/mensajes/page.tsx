import type { Metadata } from "next";
import { requirePerm } from "@/lib/auth";
import { getMessages, type ContactMessage } from "@/lib/messages";
import { markMessageRead, deleteMessage } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mensajes", robots: { index: false, follow: false } };

function fecha(c: ContactMessage): string {
  try {
    return new Intl.DateTimeFormat("es", { timeZone: "America/Bogota", dateStyle: "medium", timeStyle: "short" }).format(new Date(c.created_at));
  } catch {
    return "";
  }
}

function Tarjeta({ m }: { m: ContactMessage }) {
  return (
    <div className={`rounded-lg border p-4 ${m.leido ? "border-efa-ash/20 bg-efa-ink/60" : "border-efa-red/50 bg-efa-ink"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-semibold text-efa-bone">{m.nombre}</p>
          <p className="truncate text-sm text-efa-ash">{m.email} · {fecha(m)}</p>
        </div>
        {!m.leido && (
          <span className="rounded-full bg-efa-red px-3 py-1 text-xs font-semibold uppercase text-efa-chalk">Nuevo</span>
        )}
      </div>

      <p className="mt-3 whitespace-pre-line text-efa-bone/90">{m.mensaje}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${m.email}?subject=${encodeURIComponent("Respuesta de EFA Voley Club")}`}
          className="rounded-md bg-efa-bone px-3 py-2 text-sm font-semibold text-efa-ink hover:opacity-90"
        >
          Responder
        </a>
        <form action={markMessageRead}>
          <input type="hidden" name="id" value={m.id} />
          <input type="hidden" name="leido" value={m.leido ? "false" : "true"} />
          <button className="rounded-md border border-efa-ash/50 px-3 py-2 text-sm font-semibold text-efa-bone hover:border-efa-red hover:text-efa-red">
            {m.leido ? "Marcar como no leído" : "Marcar como leído"}
          </button>
        </form>
        <form action={deleteMessage}>
          <input type="hidden" name="id" value={m.id} />
          <button className="text-sm font-semibold text-efa-red hover:underline">Borrar</button>
        </form>
      </div>
    </div>
  );
}

export default async function AdminMensajesPage() {
  await requirePerm("mensajes");
  const mensajes = await getMessages();
  const nuevos = mensajes.filter((m) => !m.leido);

  return (
    <div>
      <h1 className="mb-2 text-4xl">Mensajes</h1>
      <p className="mb-8 text-efa-ash">{nuevos.length} sin leer · {mensajes.length} en total</p>

      {mensajes.length === 0 ? (
        <p className="text-efa-ash">Aún no hay mensajes. Los del formulario de contacto aparecerán aquí.</p>
      ) : (
        <div className="space-y-4">{mensajes.map((m) => <Tarjeta key={m.id} m={m} />)}</div>
      )}
    </div>
  );
}
