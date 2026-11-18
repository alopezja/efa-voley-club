import type { Metadata } from "next";
import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { getAllArticles } from "@/lib/articles";
import { deleteArticle } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Noticias", robots: { index: false, follow: false } };

export default async function AdminNoticiasPage() {
  await requirePerm("noticias");
  const articles = await getAllArticles();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-4xl">Noticias</h1>
        <Link
          href="/admin/noticias/nueva"
          className="rounded-md bg-efa-red px-4 py-2 text-sm font-semibold text-efa-chalk hover:opacity-90"
        >
          Nueva noticia
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-efa-ash">Aún no hay noticias. Crea la primera.</p>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div
              key={a.id}
              className="flex flex-col gap-3 rounded-lg border border-efa-ash/30 bg-efa-ink p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-efa-bone">{a.titulo}</p>
                <p className="text-sm text-efa-ash">/noticias/{a.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                    a.estado === "publicado" ? "bg-green-500/20 text-green-300" : "bg-efa-ash/20 text-efa-ash"
                  }`}
                >
                  {a.estado}
                </span>
                <Link
                  href={`/admin/noticias/${a.id}`}
                  className="rounded-md border border-efa-ash/50 px-3 py-2 text-sm font-semibold text-efa-bone hover:border-efa-red hover:text-efa-red"
                >
                  Editar
                </Link>
                <form action={deleteArticle}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-sm font-semibold text-efa-red hover:underline">Borrar</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
