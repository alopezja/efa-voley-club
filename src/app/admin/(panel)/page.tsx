import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-efa-ash/30 bg-efa-ink p-6">
      <p className="font-display text-5xl text-efa-bone">{value}</p>
      <p className="mt-2 text-base text-efa-ash">{label}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const [players, messages, articles, convocatorias] = await Promise.all([
    supabase.from("players").select("*", { count: "exact", head: true }).eq("estado", "pendiente"),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("leido", false),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("estado", "publicado"),
    supabase
      .from("convocatorias")
      .select("*", { count: "exact", head: true })
      .gte("fecha_torneo", new Date().toISOString()),
  ]);

  return (
    <div>
      <h1 className="text-4xl">Hola</h1>
      <p className="mt-2 text-base text-efa-ash">{user.email}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Jugadores pendientes" value={players.count ?? 0} />
        <Card label="Mensajes sin leer" value={messages.count ?? 0} />
        <Card label="Noticias publicadas" value={articles.count ?? 0} />
        <Card label="Próximas convocatorias" value={convocatorias.count ?? 0} />
      </div>
    </div>
  );
}
