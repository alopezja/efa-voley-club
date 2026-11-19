import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { getConvocatoriaById } from "@/lib/convocatorias";
import { getAprobadosBasico } from "@/lib/players";
import { getConvocadosIds } from "@/lib/convocados";
import { ConvocatoriaEditor } from "@/components/admin/convocatoria-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editar convocatoria", robots: { index: false, follow: false } };

export default async function EditarConvocatoriaPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePerm("convocatorias");
  const { id } = await params;
  const convocatoria = await getConvocatoriaById(id);
  if (!convocatoria) notFound();
  const [players, convocadosIds] = await Promise.all([getAprobadosBasico(), getConvocadosIds(id)]);

  return (
    <div>
      <Link href="/admin/convocatorias" className="text-sm text-efa-ash hover:text-efa-bone">
        ← Volver a convocatorias
      </Link>
      <h1 className="mb-8 mt-2 text-4xl">Editar convocatoria</h1>
      <ConvocatoriaEditor convocatoria={convocatoria} players={players} convocadosIds={convocadosIds} />
    </div>
  );
}
