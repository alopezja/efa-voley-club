import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPublishedArticles, type Article } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Noticias",
  description: "Noticias y novedades de Eso Fue Adentro Voley Club: partidos, encuentros y vida del club.",
};

function fecha(a: Article): string {
  const d = a.fecha_publicacion ?? a.created_at;
  try {
    return new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
  } catch {
    return "";
  }
}

export default async function NoticiasPage() {
  const articles = await getPublishedArticles();

  return (
    <Section tone="light">
      <Container>
        <div className="max-w-2xl border-l-2 border-efa-red pl-6">
          <h1 className="text-4xl text-efa-ink sm:text-6xl">Noticias</h1>
          <p className="mt-5 text-lg text-efa-ink/70">Lo último del club, dentro y fuera de la cancha.</p>
        </div>

        <div className="mt-12">
          {articles.length === 0 ? (
            <p className="text-efa-ink/60">Pronto publicaremos novedades. ¡Vuelve en unos días!</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/noticias/${a.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-efa-sand bg-white/40 transition hover:border-efa-red"
                >
                  <div className="aspect-video overflow-hidden bg-efa-sand">
                    {a.imagen_portada_url && (
                      <img
                        src={a.imagen_portada_url}
                        alt={a.titulo}
                        loading="lazy"
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs uppercase tracking-wide text-efa-ash">{fecha(a)}</p>
                    <h2 className="mt-2 font-display text-xl uppercase leading-tight text-efa-ink">{a.titulo}</h2>
                    {a.resumen && <p className="mt-2 line-clamp-3 text-sm text-efa-ink/70">{a.resumen}</p>}
                    <span className="mt-4 text-sm font-semibold text-efa-red">Leer más →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
