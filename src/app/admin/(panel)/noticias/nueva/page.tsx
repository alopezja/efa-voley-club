import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ArticleEditor } from "@/components/admin/article-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nueva noticia", robots: { index: false, follow: false } };

export default async function NuevaNoticiaPage() {
  await requireAdmin();
  return (
    <div>
      <Link href="/admin/noticias" className="text-sm text-efa-ash hover:text-efa-bone">
        ← Volver a noticias
      </Link>
      <h1 className="mb-8 mt-2 text-4xl">Nueva noticia</h1>
      <ArticleEditor />
    </div>
  );
}
