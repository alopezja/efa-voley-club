import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getSchedules, type Schedule } from "@/lib/schedules";
import { createSchedule, updateSchedule, deleteSchedule } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Horarios", robots: { index: false, follow: false } };

const input =
  "w-full rounded-md border border-efa-ash/40 bg-efa-ink px-3 py-2 text-sm text-efa-bone placeholder:text-efa-ash focus:border-efa-red focus:outline-none";

function Campos({ s }: { s?: Schedule }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm text-efa-ash">
        Día
        <input name="dia" required defaultValue={s?.dia ?? ""} placeholder="Martes" className={`mt-1 ${input}`} />
      </label>
      <label className="text-sm text-efa-ash">
        Horario
        <input name="horario" defaultValue={s?.horario ?? ""} placeholder="8:00 – 11:00 pm" className={`mt-1 ${input}`} />
      </label>
      <label className="text-sm text-efa-ash">
        Lugar
        <input name="lugar" defaultValue={s?.lugar ?? ""} placeholder="Cancha de Manila" className={`mt-1 ${input}`} />
      </label>
      <label className="text-sm text-efa-ash">
        Orden
        <input name="orden" type="number" defaultValue={s?.orden ?? 0} className={`mt-1 ${input}`} />
      </label>
      <label className="text-sm text-efa-ash sm:col-span-2">
        Descripción (opcional)
        <input name="descripcion" defaultValue={s?.descripcion ?? ""} placeholder="Entrada por la portería norte" className={`mt-1 ${input}`} />
      </label>
      <label className="text-sm text-efa-ash sm:col-span-2">
        Enlace de Google Maps (opcional)
        <input name="maps_url" type="url" defaultValue={s?.maps_url ?? ""} placeholder="https://maps.google.com/..." className={`mt-1 ${input}`} />
      </label>
    </div>
  );
}

export default async function AdminHorariosPage() {
  await requireAdmin();
  const schedules = await getSchedules();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-4xl">Horarios</h1>
      <p className="mb-8 text-efa-ash">
        Edita dónde y cuándo juega el club. La portada muestra los primeros dos (por orden).
      </p>

      <section className="mb-10 space-y-6">
        {schedules.map((s) => (
          <form key={s.id} action={updateSchedule} className="rounded-lg border border-efa-ash/30 bg-efa-ink p-4">
            <input type="hidden" name="id" value={s.id} />
            <Campos s={s} />
            <div className="mt-4 flex items-center gap-3">
              <button formAction={updateSchedule} className="rounded-md bg-efa-red px-4 py-2 text-sm font-semibold text-efa-chalk hover:opacity-90">
                Guardar
              </button>
              <button formAction={deleteSchedule} className="text-sm font-semibold text-efa-red hover:underline">
                Borrar
              </button>
            </div>
          </form>
        ))}
        {schedules.length === 0 && <p className="text-efa-ash">No hay horarios. Agrega el primero abajo.</p>}
      </section>

      <section>
        <h2 className="mb-4 text-2xl text-efa-bone">Agregar horario</h2>
        <form action={createSchedule} className="rounded-lg border border-dashed border-efa-ash/40 p-4">
          <Campos />
          <div className="mt-4">
            <button className="rounded-md bg-efa-bone px-4 py-2 text-sm font-semibold text-efa-ink hover:opacity-90">
              Agregar
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
