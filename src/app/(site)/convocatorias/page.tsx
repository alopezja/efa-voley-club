import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPublishedConvocatorias, type Convocatoria } from "@/lib/convocatorias";

export const metadata: Metadata = {
  title: "Convocatorias",
  description: "Convocatorias a torneos y partidos de Eso Fue Adentro Voley Club. Entérate de las próximas fechas.",
};

function fechaLarga(c: Convocatoria): string {
  if (!c.fecha_torneo) return "";
  try {
    return new Intl.DateTimeFormat("es", { dateStyle: "full", timeStyle: "short" }).format(new Date(c.fecha_torneo));
  } catch {
    return "";
  }
}

export default async function ConvocatoriasPage() {
  const items = await getPublishedConvocatorias();

  return (
    <Section tone="light">
      <Container>
        <div className="max-w-2xl border-l-2 border-efa-red pl-6">
          <h1 className="text-4xl text-efa-ink sm:text-6xl">Convocatorias</h1>
          <p className="mt-5 text-lg text-efa-ink/70">Torneos y partidos a los que convoca el club.</p>
        </div>

        <div className="mt-12">
          {items.length === 0 ? (
            <p className="text-efa-ink/60">Aún no hay convocatorias abiertas. ¡Muy pronto!</p>
          ) : (
            <div className="space-y-5">
              {items.map((c) => (
                <Link
                  key={c.id}
                  href={`/convocatorias/${c.slug}`}
                  className="group flex flex-col gap-4 overflow-hidden rounded-lg border border-efa-sand bg-white/40 p-5 transition hover:border-efa-red sm:flex-row sm:items-center"
                >
                  {c.imagen_portada_url && (
                    <img
                      src={c.imagen_portada_url}
                      alt={c.titulo}
                      loading="lazy"
                      className="h-40 w-full rounded-md object-cover sm:h-24 sm:w-40"
                    />
                  )}
                  <div className="flex-1">
                    {c.fecha_torneo && (
                      <p className="text-xs uppercase tracking-wide text-efa-red">{fechaLarga(c)}</p>
                    )}
                    <h2 className="mt-1 font-display text-xl uppercase leading-tight text-efa-ink">{c.titulo}</h2>
                    <p className="mt-1 text-sm text-efa-ink/70">
                      {[c.lugar, c.categoria].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-efa-red">Ver convocatoria →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
