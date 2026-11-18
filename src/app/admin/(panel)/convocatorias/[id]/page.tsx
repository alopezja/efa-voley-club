import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getConvocatoriaById } from "@/lib/convocatorias";
import { ConvocatoriaEditor } from "@/components/admin/convocatoria-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editar convocatoria", robots: { index: false, follow: false } };

export default async function EditarConvocatoriaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const convocatoria = await getConvocatoriaById(id);
  if (!convocatoria) notFound();

  return (
    <div>
      <Link href="/admin/convocatorias" className="text-sm text-efa-ash hover:text-efa-bone">
        ← Volver a convocatorias
      </Link>
      <h1 className="mb-8 mt-2 text-4xl">Editar convocatoria</h1>
      <ConvocatoriaEditor convocatoria={convocatoria} />
    </div>
  );
}
