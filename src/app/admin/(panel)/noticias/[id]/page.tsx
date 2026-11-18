import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getArticleById } from "@/lib/articles";
import { ArticleEditor } from "@/components/admin/article-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editar noticia", robots: { index: false, follow: false } };

export default async function EditarNoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  return (
    <div>
      <Link href="/admin/noticias" className="text-sm text-efa-ash hover:text-efa-bone">
        ← Volver a noticias
      </Link>
      <h1 className="mb-8 mt-2 text-4xl">Editar noticia</h1>
      <ArticleEditor article={article} />
    </div>
  );
}
