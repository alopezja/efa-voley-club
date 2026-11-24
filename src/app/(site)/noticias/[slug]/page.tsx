import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getArticleBySlug, getPublishedArticles } from "@/lib/articles";

export const revalidate = 300;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) return { title: "Noticia no encontrada" };
  const description = a.resumen ?? (a.cuerpo ?? "").slice(0, 155);
  return {
    title: a.titulo,
    description,
    openGraph: {
      title: a.titulo,
      description,
      type: "article",
      images: a.imagen_portada_url ? [a.imagen_portada_url] : undefined,
    },
  };
}

function fechaLarga(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es", { timeZone: "America/Bogota", day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
  } catch {
    return "";
  }
}

export default async function NoticiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a || a.estado !== "publicado") notFound();

  const fecha = a.fecha_publicacion ?? a.created_at;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.titulo,
    datePublished: fecha,
    dateModified: a.updated_at,
    image: a.imagen_portada_url ? [a.imagen_portada_url] : undefined,
    author: { "@type": "Organization", name: a.autor || "Eso Fue Adentro Voley Club" },
    publisher: { "@type": "Organization", name: "Eso Fue Adentro Voley Club" },
  };

  return (
    <Section tone="light">
      <Container>
        <article className="mx-auto max-w-3xl">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <Link href="/noticias" className="text-sm font-semibold text-efa-red hover:underline">
            ← Noticias
          </Link>
          <p className="mt-6 text-xs uppercase tracking-wide text-efa-ash">
            {fechaLarga(fecha)}
            {a.autor ? ` · ${a.autor}` : ""}
          </p>
          <h1 className="mt-2 text-4xl text-efa-ink sm:text-5xl">{a.titulo}</h1>
          {a.resumen && <p className="mt-4 text-lg text-efa-ink/70">{a.resumen}</p>}

          {a.imagen_portada_url && (
            <img
              src={a.imagen_portada_url}
              alt={a.titulo}
              className="mt-8 w-full rounded-lg object-cover"
            />
          )}

          {a.cuerpo && (
            <div className="mt-8 whitespace-pre-line text-lg leading-relaxed text-efa-ink/90">{a.cuerpo}</div>
          )}
        </article>
      </Container>
    </Section>
  );
}
