import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getSchedules } from "@/lib/schedules";
import { ScheduleRow, ScheduleAddForm } from "@/components/admin/schedule-forms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Horarios", robots: { index: false, follow: false } };

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
          <ScheduleRow key={s.id} s={s} />
        ))}
        {schedules.length === 0 && <p className="text-efa-ash">No hay horarios. Agrega el primero abajo.</p>}
      </section>

      <section>
        <h2 className="mb-4 text-2xl text-efa-bone">Agregar horario</h2>
        <ScheduleAddForm />
      </section>
    </div>
  );
}
