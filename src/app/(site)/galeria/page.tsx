import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getGalleryItems } from "@/lib/gallery";
import { GalleryGrid } from "@/components/gallery-grid";

export const metadata: Metadata = {
  title: "Galería",
  description:
    "Fotos y videos de Eso Fue Adentro Voley Club: entrenamientos, partidos y momentos del club.",
};

export default async function GaleriaPage() {
  const items = await getGalleryItems();
  return (
    <Section tone="light">
      <Container>
        <div className="max-w-2xl border-l-2 border-efa-red pl-6">
          <h1 className="text-4xl text-efa-ink sm:text-6xl">Galería</h1>
          <p className="mt-5 text-lg text-efa-ink/70">Momentos del club dentro y fuera de la cancha.</p>
        </div>
        <div className="mt-12">
          {items.length === 0 ? (
            <p className="text-efa-ink/60">Pronto subiremos fotos y videos. ¡Vuelve en unos días!</p>
          ) : (
            <GalleryGrid items={items} />
          )}
        </div>
      </Container>
    </Section>
  );
}
