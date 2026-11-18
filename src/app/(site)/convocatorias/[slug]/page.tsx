import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getConvocatoriaBySlug, getPublishedConvocatorias } from "@/lib/convocatorias";

export const revalidate = 300;

export async function generateStaticParams() {
  const items = await getPublishedConvocatorias();
  return items.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getConvocatoriaBySlug(slug);
  if (!c) return { title: "Convocatoria no encontrada" };
  const description = c.descripcion?.slice(0, 155) ?? `Convocatoria de EFA Voley Club: ${c.titulo}`;
  return {
    title: c.titulo,
    description,
    openGraph: {
      title: c.titulo,
      description,
      type: "article",
      images: c.imagen_portada_url ? [c.imagen_portada_url] : undefined,
    },
  };
}

function fechaLarga(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es", { dateStyle: "full", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return "";
  }
}

export default async function ConvocatoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getConvocatoriaBySlug(slug);
  if (!c || c.estado !== "publicado") notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: c.titulo,
    sport: "Volleyball",
    startDate: c.fecha_torneo ?? undefined,
    location: c.lugar ? { "@type": "Place", name: c.lugar } : undefined,
    image: c.imagen_portada_url ? [c.imagen_portada_url] : undefined,
    description: c.descripcion ?? undefined,
    organizer: { "@type": "Organization", name: "Eso Fue Adentro Voley Club" },
  };

  return (
    <Section tone="light">
      <Container>
        <article className="mx-auto max-w-3xl">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <Link href="/convocatorias" className="text-sm font-semibold text-efa-red hover:underline">
            ← Convocatorias
          </Link>

          {c.fecha_torneo && (
            <p className="mt-6 text-xs uppercase tracking-wide text-efa-red">{fechaLarga(c.fecha_torneo)}</p>
          )}
          <h1 className="mt-2 text-4xl text-efa-ink sm:text-5xl">{c.titulo}</h1>
          <p className="mt-3 text-efa-ink/70">{[c.lugar, c.categoria].filter(Boolean).join(" · ")}</p>

          {c.imagen_portada_url && (
            <img src={c.imagen_portada_url} alt={c.titulo} className="mt-8 w-full rounded-lg object-cover" />
          )}

          {c.descripcion && (
            <div className="mt-8 whitespace-pre-line text-lg leading-relaxed text-efa-ink/90">{c.descripcion}</div>
          )}

          <div className="mt-10 border-t border-efa-sand pt-8">
            <p className="text-efa-ink/80">¿Quieres participar con el club?</p>
            <Link
              href="/registro"
              className="mt-3 inline-flex items-center rounded-sm bg-efa-ink px-6 py-3 font-semibold text-efa-bone transition hover:bg-efa-red"
            >
              Súmate al club
            </Link>
          </div>
        </article>
      </Container>
    </Section>
  );
}
