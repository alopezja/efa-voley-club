import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ConvocatoriaEditor } from "@/components/admin/convocatoria-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nueva convocatoria", robots: { index: false, follow: false } };

export default async function NuevaConvocatoriaPage() {
  await requireAdmin();
  return (
    <div>
      <Link href="/admin/convocatorias" className="text-sm text-efa-ash hover:text-efa-bone">
        ← Volver a convocatorias
      </Link>
      <h1 className="mb-8 mt-2 text-4xl">Nueva convocatoria</h1>
      <ConvocatoriaEditor />
    </div>
  );
}
