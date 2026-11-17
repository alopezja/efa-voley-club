import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getGalleryItems } from "@/lib/gallery";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Galería", robots: { index: false, follow: false } };

export default async function AdminGaleriaPage() {
  await requireAdmin();
  const items = await getGalleryItems();
  return (
    <div>
      <h1 className="mb-8 text-4xl">Galería</h1>
      <GalleryManager items={items} />
    </div>
  );
}
